<?php

namespace App\Controller\Api;

use App\Entity\Usuario;
use App\Repository\UsuarioRepository;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class AuthController
{
    public function __construct(private EntityManagerInterface $em, private UsuarioRepository $usuarios, private JwtService $jwt)
    {
    }

    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent() ?: '', true);
        if (!is_array($data) || empty($data)) {
            $data = $request->request->all();
        }
        $email = trim((string)($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');

        if (!$email || !$password) {
            return new JsonResponse(['error' => 'Email y contraseña son obligatorios'], 400);
        }

        /** @var Usuario|null $user */
        $user = $this->usuarios->findOneBy(['email' => $email]);
        if (!$user) {
            return new JsonResponse(['error' => 'Credenciales inválidas'], 401);
        }
        $stored = $user->getContrasena();
        $ok = password_verify($password, $stored);
        if (!$ok) {
            // Migración perezosa: si coincide texto plano, rehashear y aceptar
            if ($stored === $password) {
                $user->setContrasena(password_hash($password, PASSWORD_DEFAULT));
                $this->em->flush();
            } else {
                return new JsonResponse(['error' => 'Credenciales inválidas'], 401);
            }
        }

        $token = $this->jwt->createToken([
            'sub' => $user->getId(),
            'email' => $user->getEmail(),
            'rol' => $user->getRol(),
            'nombre' => $user->getNombre(),
        ]);

        $usuario = [
            'id' => $user->getId(),
            'nombre' => $user->getNombre(),
            'email' => $user->getEmail(),
            'foto_perfil' => $user->getFotoPerfil(),
            'rol' => $user->getRol(),
        ];

        return new JsonResponse(['token' => $token, 'usuario' => $usuario], 200);
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(Request $request): JsonResponse
    {
        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer ')) {
            return new JsonResponse(['error' => 'Token ausente'], 401);
        }
        $token = substr($auth, 7);
        $payload = $this->jwt->verifyToken($token);
        if (!$payload || !isset($payload['sub'])) {
            return new JsonResponse(['error' => 'Token inválido'], 401);
        }
        $user = $this->usuarios->find((int)$payload['sub']);
        if (!$user) {
            return new JsonResponse(['error' => 'Usuario no encontrado'], 404);
        }
        $usuario = [
            'id' => $user->getId(),
            'nombre' => $user->getNombre(),
            'email' => $user->getEmail(),
            'foto_perfil' => $user->getFotoPerfil(),
            'rol' => $user->getRol(),
        ];
        return new JsonResponse($usuario, 200);
    }
}