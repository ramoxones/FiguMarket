<?php

namespace App\Controller\Api;

use App\Entity\ConversacionArchivada;
use App\Repository\ConversacionArchivadaRepository;
use App\Repository\UsuarioRepository;
use App\Repository\FiguraRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/conversaciones-archivadas')]
class ConversacionArchivadaController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ConversacionArchivadaRepository $repo,
        private UsuarioRepository $usuarios,
        private FiguraRepository $figuras,
    ) {}

    #[Route('', name: 'api_archivadas_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $ownerId = (int) $request->query->get('owner_id');
        if (!$ownerId) { return new JsonResponse([], 200); }
        $owner = $this->usuarios->find($ownerId);
        if (!$owner) { return new JsonResponse([], 200); }
        $items = array_map(fn(ConversacionArchivada $c) => $c->toArray(), $this->repo->findBy(['owner' => $owner]));
        return new JsonResponse($items, 200);
    }

    #[Route('', name: 'api_archivadas_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        foreach (['owner_id','otro_usuario_id'] as $field) {
            if (!isset($data[$field])) { return new JsonResponse(['error' => "Falta el campo '$field'"], 400); }
        }
        $owner = $this->usuarios->find((int)$data['owner_id']);
        $otro = $this->usuarios->find((int)$data['otro_usuario_id']);
        if (!$owner || !$otro) { return new JsonResponse(['error' => 'Usuario(s) no válidos'], 400); }

        $fig = null;
        if (isset($data['figura_id'])) { $fig = $this->figuras->find((int)$data['figura_id']); }

        // Comprobar existencia previa
        $existing = $this->repo->findOneBy(['owner' => $owner, 'otroUsuario' => $otro, 'figura' => $fig]);
        if ($existing) { return new JsonResponse($existing->toArray(), 200); }

        $c = new ConversacionArchivada();
        $c->setOwner($owner)->setOtroUsuario($otro)->setFigura($fig);
        $this->em->persist($c);
        $this->em->flush();
        return new JsonResponse($c->toArray(), 201);
    }

    #[Route('', name: 'api_archivadas_delete', methods: ['DELETE'])]
    public function delete(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        foreach (['owner_id','otro_usuario_id'] as $field) {
            if (!isset($data[$field])) { return new JsonResponse(['error' => "Falta el campo '$field'"], 400); }
        }
        $owner = $this->usuarios->find((int)$data['owner_id']);
        $otro = $this->usuarios->find((int)$data['otro_usuario_id']);
        if (!$owner || !$otro) { return new JsonResponse(['error' => 'Usuario(s) no válidos'], 400); }
        $fig = null;
        if (isset($data['figura_id'])) { $fig = $this->figuras->find((int)$data['figura_id']); }

        $existing = $this->repo->findOneBy(['owner' => $owner, 'otroUsuario' => $otro, 'figura' => $fig]);
        if (!$existing) { return new JsonResponse(null, 204); }
        $this->em->remove($existing);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }
}