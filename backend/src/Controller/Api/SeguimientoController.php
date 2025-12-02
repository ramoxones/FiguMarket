<?php

namespace App\Controller\Api;

use App\Entity\Seguimiento;
use App\Repository\SeguimientoRepository;
use App\Repository\FiguraRepository;
use App\Repository\UsuarioRepository;
use App\Service\JwtService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/seguimientos')]
class SeguimientoController
{
    public function __construct(private EntityManagerInterface $em, private SeguimientoRepository $repo, private FiguraRepository $figuras, private UsuarioRepository $usuarios, private JwtService $jwt) {}

    #[Route('', name: 'api_seguimientos_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer ')) { return new JsonResponse(['error' => 'No autorizado'], 401); }
        $claims = $this->jwt->verifyToken(substr($auth, 7));
        if (!$claims || !isset($claims['sub'])) { return new JsonResponse(['error' => 'Token inválido'], 401); }
        $actor = $this->usuarios->find((int)$claims['sub']);
        if (!$actor) { return new JsonResponse([], 200); }
        $items = $this->repo->findBy(['usuario' => $actor]);
        $list = array_map(fn(Seguimiento $s) => ['figura_id' => $s->getFigura()?->getId(), 'created_at' => $s->getCreatedAt()->format('c')], $items);
        return new JsonResponse($list, 200);
    }

    #[Route('/count', name: 'api_seguimientos_count', methods: ['GET'])]
    public function count(Request $request): JsonResponse
    {
        $fid = (int)($request->query->get('figura_id') ?? 0);
        if ($fid <= 0) { return new JsonResponse(['error' => 'figura_id requerido'], 400); }
        $c = $this->repo->count(['figura' => $this->figuras->find($fid)]);
        return new JsonResponse(['figura_id' => $fid, 'count' => $c], 200);
    }

    #[Route('/counts', name: 'api_seguimientos_counts', methods: ['GET'])]
    public function counts(Request $request): JsonResponse
    {
        $idsParam = (string)$request->query->get('ids', '');
        $ids = array_values(array_filter(array_map(fn($x) => (int)trim($x), explode(',', $idsParam)), fn($n) => $n > 0));
        if (empty($ids)) return new JsonResponse([]);
        $result = [];
        foreach ($ids as $fid) {
            $result[$fid] = $this->repo->count(['figura' => $this->figuras->find($fid)]);
        }
        return new JsonResponse($result, 200);
    }

    #[Route('', name: 'api_seguimientos_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer ')) { return new JsonResponse(['error' => 'No autorizado'], 401); }
        $claims = $this->jwt->verifyToken(substr($auth, 7));
        if (!$claims || !isset($claims['sub'])) { return new JsonResponse(['error' => 'Token inválido'], 401); }
        $actor = $this->usuarios->find((int)$claims['sub']);
        if (!$actor) { return new JsonResponse(['error' => 'Usuario inválido'], 400); }
        $data = json_decode($request->getContent() ?: '{}', true);
        $fid = (int)($data['figura_id'] ?? 0);
        $figura = $fid > 0 ? $this->figuras->find($fid) : null;
        if (!$figura) { return new JsonResponse(['error' => 'Figura no válida'], 400); }
        $exist = $this->repo->findOneBy(['usuario' => $actor, 'figura' => $figura]);
        if ($exist) { return new JsonResponse(['figura_id' => $figura->getId()], 200); }
        $s = new Seguimiento();
        $s->setUsuario($actor)->setFigura($figura);
        $this->em->persist($s);
        $this->em->flush();
        return new JsonResponse(['figura_id' => $figura->getId()], 201);
    }

    #[Route('', name: 'api_seguimientos_delete', methods: ['DELETE'])]
    public function delete(Request $request): JsonResponse
    {
        $auth = $request->headers->get('Authorization', '');
        if (!str_starts_with($auth, 'Bearer ')) { return new JsonResponse(['error' => 'No autorizado'], 401); }
        $claims = $this->jwt->verifyToken(substr($auth, 7));
        if (!$claims || !isset($claims['sub'])) { return new JsonResponse(['error' => 'Token inválido'], 401); }
        $actor = $this->usuarios->find((int)$claims['sub']);
        if (!$actor) { return new JsonResponse(['error' => 'Usuario inválido'], 400); }
        $data = json_decode($request->getContent() ?: '{}', true);
        $fid = (int)($data['figura_id'] ?? 0);
        $figura = $fid > 0 ? $this->figuras->find($fid) : null;
        if (!$figura) { return new JsonResponse(['error' => 'Figura no válida'], 400); }
        $exist = $this->repo->findOneBy(['usuario' => $actor, 'figura' => $figura]);
        if ($exist) { $this->em->remove($exist); $this->em->flush(); }
        return new JsonResponse(['figura_id' => $figura->getId()], 200);
    }
}