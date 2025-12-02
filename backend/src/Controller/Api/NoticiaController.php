<?php

namespace App\Controller\Api;

use App\Entity\Noticia;
use App\Repository\NoticiaRepository;
use App\Repository\UsuarioRepository;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/noticias')]
class NoticiaController
{
    public function __construct(
        private EntityManagerInterface $em,
        private NoticiaRepository $repo,
        private UsuarioRepository $usuarios,
        private JwtService $jwt,
    ) {}

    #[Route('', name: 'api_noticias_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $items = array_map(fn(Noticia $n) => $n->toArray(), $this->repo->findLatest(50));
        return new JsonResponse($items, 200);
    }

    #[Route('', name: 'api_noticias_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer ')) { return new JsonResponse(['error' => 'No autorizado'], 401); }
        $claims = $this->jwt->verifyToken(substr($auth, 7));
        if (!$claims || !isset($claims['sub'])) { return new JsonResponse(['error' => 'Token inválido'], 401); }
        $actor = $this->usuarios->find((int)$claims['sub']);
        if (!$actor || $actor->getRol() !== 'admin') { return new JsonResponse(['error' => 'Prohibido'], 403); }

        $data = json_decode($request->getContent() ?: '', true);
        if (!is_array($data) || empty($data)) { $data = $request->request->all(); }
        $titulo = trim((string)($data['titulo'] ?? ''));
        if ($titulo === '') { return new JsonResponse(['error' => "Falta el campo 'titulo'"], 400); }

        $n = new Noticia();
        $n->setTitulo($titulo)
          ->setResumen(isset($data['resumen']) ? (string)$data['resumen'] : null)
          ->setDescripcion(isset($data['descripcion']) ? (string)$data['descripcion'] : null)
          ->setUrl(isset($data['url']) ? (string)$data['url'] : null)
          ->setImagen(isset($data['imagen']) ? (string)$data['imagen'] : null);

        $this->em->persist($n);
        $this->em->flush();
        return new JsonResponse($n->toArray(), 201);
    }

    #[Route('/{id}', name: 'api_noticias_update', methods: ['PUT','PATCH'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $n = $this->repo->find($id);
        if (!$n) { return new JsonResponse(['error' => 'Noticia no encontrada'], 404); }
        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer ')) { return new JsonResponse(['error' => 'No autorizado'], 401); }
        $claims = $this->jwt->verifyToken(substr($auth, 7));
        if (!$claims || !isset($claims['sub'])) { return new JsonResponse(['error' => 'Token inválido'], 401); }
        $actor = $this->usuarios->find((int)$claims['sub']);
        if (!$actor || $actor->getRol() !== 'admin') { return new JsonResponse(['error' => 'Prohibido'], 403); }

        $data = json_decode($request->getContent() ?: '', true);
        if (!is_array($data) || empty($data)) { $data = $request->request->all(); }
        if (isset($data['titulo'])) { $n->setTitulo((string)$data['titulo']); }
        if (isset($data['resumen'])) { $n->setResumen((string)$data['resumen']); }
        if (isset($data['descripcion'])) { $n->setDescripcion((string)$data['descripcion']); }
        if (isset($data['imagen'])) { $n->setImagen((string)$data['imagen']); }
        if (isset($data['url'])) { $n->setUrl((string)$data['url']); }
        $this->em->flush();
        return new JsonResponse($n->toArray(), 200);
    }

    #[Route('/{id}', name: 'api_noticias_delete', methods: ['DELETE'])]
    public function delete(Request $request, int $id): JsonResponse
    {
        $n = $this->repo->find($id);
        if (!$n) { return new JsonResponse(null, 404); }
        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer ')) { return new JsonResponse(['error' => 'No autorizado'], 401); }
        $claims = $this->jwt->verifyToken(substr($auth, 7));
        if (!$claims || !isset($claims['sub'])) { return new JsonResponse(['error' => 'Token inválido'], 401); }
        $actor = $this->usuarios->find((int)$claims['sub']);
        if (!$actor || $actor->getRol() !== 'admin') { return new JsonResponse(['error' => 'Prohibido'], 403); }

        $this->em->remove($n);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}