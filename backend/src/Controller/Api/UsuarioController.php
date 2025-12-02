<?php

namespace App\Controller\Api;

use App\Entity\Usuario;
use App\Repository\UsuarioRepository;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/usuarios')]
class UsuarioController
{
    public function __construct(private EntityManagerInterface $em, private UsuarioRepository $repo, private JwtService $jwt) {}

    #[Route('', name: 'api_usuarios_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $usuarios = array_map(fn(Usuario $u) => $u->toArray(), $this->repo->findAll());
        return new JsonResponse($usuarios, 200);
    }

    #[Route('/{id}', name: 'api_usuarios_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $usuario = $this->repo->find($id);
        if (!$usuario) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }
        return new JsonResponse($usuario->toArray(), 200);
    }

    #[Route('', name: 'api_usuarios_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        foreach (['nombre','email','contrasena','rol'] as $field) {
            if (!isset($data[$field])) {
                return new JsonResponse(['error' => "Falta el campo '$field'"], 400);
            }
        }
        $rol = $data['rol'];
        if (!in_array($rol, ['usuario','admin'], true)) {
            return new JsonResponse(['error' => 'Rol inválido'], 400);
        }
        if ($this->repo->findOneBy(['email' => $data['email']])) {
            return new JsonResponse(['error' => 'Email ya existe'], 409);
        }
        $u = new Usuario();
        $u->setNombre($data['nombre'])
          ->setEmail($data['email'])
          ->setContrasena(password_hash($data['contrasena'], PASSWORD_DEFAULT))
          ->setRol($rol);
        if (isset($data['foto_perfil'])) { $u->setFotoPerfil($data['foto_perfil']); }
        $this->em->persist($u);
        $this->em->flush();
        return new JsonResponse($u->toArray(), 201);
    }

    #[Route('/{id}', name: 'api_usuarios_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $u = $this->repo->find($id);
        if (!$u) { return new JsonResponse([], 404); }
        $this->em->remove($u);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }

    #[Route('/{id}', name: 'api_usuarios_update', methods: ['PUT','PATCH'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $u = $this->repo->find($id);
        if (!$u) { return new JsonResponse(['error' => 'Usuario no encontrado'], 404); }

        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer ')) {
            return new JsonResponse(['error' => 'No autorizado'], 401);
        }
        $token = substr($auth, 7);
        $claims = $this->jwt->verifyToken($token);
        if (!$claims || !isset($claims['sub'])) {
            return new JsonResponse(['error' => 'Token inválido'], 401);
        }

        $actorId = (int)$claims['sub'];
        $actor = $this->repo->find($actorId);
        if (!$actor) { return new JsonResponse(['error' => 'No autorizado'], 401); }
        $esAdmin = $actor->getRol() === 'admin';
        if (!$esAdmin && $actorId !== $u->getId()) {
            return new JsonResponse(['error' => 'Prohibido'], 403);
        }

        // Soportar JSON y form-urlencoded
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) { $data = $request->request->all(); }

        // Validaciones ligeras y actualización de campos permitidos
        if (isset($data['email'])) {
            $nuevoEmail = trim((string)$data['email']);
            if ($nuevoEmail !== '' && $nuevoEmail !== $u->getEmail()) {
                $existe = $this->repo->findOneBy(['email' => $nuevoEmail]);
                if ($existe && $existe->getId() !== $u->getId()) {
                    return new JsonResponse(['error' => 'Email ya existe'], 409);
                }
                $u->setEmail($nuevoEmail);
            }
        }
        if (isset($data['nombre'])) {
            $u->setNombre((string)$data['nombre']);
        }
        if (isset($data['foto_perfil'])) {
            $u->setFotoPerfil((string)$data['foto_perfil']);
        }
        if (isset($data['contrasena'])) {
            $plain = (string)$data['contrasena'];
            if ($plain !== '') {
                $u->setContrasena(password_hash($plain, PASSWORD_DEFAULT));
            }
        }

        $this->em->flush();
        return new JsonResponse($u->toArray(), 200);
    }

    #[Route('/{id}/foto', name: 'api_usuarios_upload_photo', methods: ['POST'])]
    public function uploadPhoto(Request $request, int $id): JsonResponse
    {
        $u = $this->repo->find($id);
        if (!$u) { return new JsonResponse(['error' => 'Usuario no encontrado'], 404); }

        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer ')) {
            return new JsonResponse(['error' => 'No autorizado'], 401);
        }
        $token = substr($auth, 7);
        $claims = $this->jwt->verifyToken($token);
        if (!$claims || !isset($claims['sub'])) {
            return new JsonResponse(['error' => 'Token inválido'], 401);
        }
        $actorId = (int)$claims['sub'];
        $actor = $this->repo->find($actorId);
        if (!$actor) { return new JsonResponse(['error' => 'No autorizado'], 401); }
        $esAdmin = $actor->getRol() === 'admin';
        if (!$esAdmin && $actorId !== $u->getId()) {
            return new JsonResponse(['error' => 'Prohibido'], 403);
        }

        /** @var UploadedFile|null $file */
        $file = $request->files->get('file');
        if (!$file) { return new JsonResponse(['error' => 'Archivo no recibido'], 400); }
        if (!$file->isValid()) { return new JsonResponse(['error' => 'Archivo inválido'], 400); }

        $ext = strtolower($file->guessExtension() ?: $file->getClientOriginalExtension() ?: 'jpg');
        $allowed = ['jpg','jpeg','png','gif','webp'];
        if (!in_array($ext, $allowed, true)) { return new JsonResponse(['error' => 'Formato no soportado'], 415); }

        $uploadsDir = __DIR__ . '/../../../public/uploads/perfiles';
        if (!is_dir($uploadsDir)) { @mkdir($uploadsDir, 0777, true); }
        $filename = bin2hex(random_bytes(8)) . '.' . $ext;
        try {
            $file->move($uploadsDir, $filename);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => 'No se pudo guardar la imagen'], 500);
        }

        $publicPath = '/uploads/perfiles/' . $filename;
        $u->setFotoPerfil($publicPath);
        $this->em->flush();
        return new JsonResponse($u->toArray(), 200);
    }
}