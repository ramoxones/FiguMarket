<?php

namespace App\Controller\Api;

use App\Entity\Mensaje;
use App\Repository\MensajeRepository;
use App\Repository\FiguraRepository;
use App\Repository\UsuarioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/mensajes')]
class MensajeController
{
    public function __construct(private EntityManagerInterface $em, private MensajeRepository $repo, private UsuarioRepository $usuarios, private FiguraRepository $figuras) {}

    #[Route('', name: 'api_mensajes_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        // Permitir filtros por query: emisor_id, receptor_id, figura_id, participante_id (OR)
        $order = strtolower((string)$request->query->get('order', 'asc')) === 'desc' ? 'DESC' : 'ASC';
        $limit = $request->query->getInt('limit', 500);
        $offset = $request->query->getInt('offset', 0);

        $participanteId = $request->query->get('participante_id');
        $figuraId = $request->query->get('figura_id');
        if ($participanteId !== null && $participanteId !== '') {
            $user = $this->usuarios->find((int)$participanteId);
            if (!$user) {
                return new JsonResponse([], 200);
            }
            $qb = $this->repo->createQueryBuilder('m')
                ->where('m.emisor = :u OR m.receptor = :u')
                ->setParameter('u', $user)
                ->orderBy('m.fechaEnvio', $order)
                ->setMaxResults($limit)
                ->setFirstResult($offset);
            if ($figuraId !== null && $figuraId !== '') {
                $fig = $this->figuras->find((int)$figuraId);
                if ($fig) { $qb->andWhere('m.figura = :fig')->setParameter('fig', $fig); }
            }
            $mensajes = array_map(fn(Mensaje $m) => $m->toArray(), $qb->getQuery()->getResult());
            return new JsonResponse($mensajes, 200);
        }

        $criteria = [];
        $emisorId = $request->query->get('emisor_id');
        $receptorId = $request->query->get('receptor_id');
        if ($emisorId !== null && $emisorId !== '') {
            $emisor = $this->usuarios->find((int)$emisorId);
            if ($emisor) { $criteria['emisor'] = $emisor; }
        }
        if ($receptorId !== null && $receptorId !== '') {
            $receptor = $this->usuarios->find((int)$receptorId);
            if ($receptor) { $criteria['receptor'] = $receptor; }
        }
        if ($figuraId !== null && $figuraId !== '') {
            $figura = $this->figuras->find((int)$figuraId);
            if ($figura) { $criteria['figura'] = $figura; }
        }
        $mensajes = array_map(
            fn(Mensaje $m) => $m->toArray(),
            $this->repo->findBy($criteria, ['fechaEnvio' => $order], $limit, $offset)
        );
        return new JsonResponse($mensajes, 200);
    }

    #[Route('/{id}', name: 'api_mensajes_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $mensaje = $this->repo->find($id);
        if (!$mensaje) {
            return new JsonResponse(['error' => 'Mensaje no encontrado'], 404);
        }
        return new JsonResponse($mensaje->toArray(), 200);
    }

    #[Route('', name: 'api_mensajes_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        foreach (['emisor_id','receptor_id','contenido'] as $field) {
            if (!isset($data[$field])) {
                return new JsonResponse(['error' => "Falta el campo '$field'"], 400);
            }
        }
        $emisor = $this->usuarios->find((int)$data['emisor_id']);
        $receptor = $this->usuarios->find((int)$data['receptor_id']);
        if (!$emisor || !$receptor) { return new JsonResponse(['error' => 'Usuario(s) no válidos'], 400); }
        $m = new Mensaje();
        $m->setEmisor($emisor)->setReceptor($receptor)->setContenido($data['contenido']);
        if (isset($data['figura_id'])) {
            $figura = $this->figuras->find((int)$data['figura_id']);
            if ($figura) { $m->setFigura($figura); }
        }
        if (isset($data['fecha_envio'])) { $m->setFechaEnvio(new \DateTimeImmutable($data['fecha_envio'])); }
        if (isset($data['leido'])) { $m->setLeido((bool)$data['leido']); }
        $this->em->persist($m);
        $this->em->flush();
        return new JsonResponse($m->toArray(), 201);
    }

    #[Route('/{id}', name: 'api_mensajes_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $m = $this->repo->find($id);
        if (!$m) { return new JsonResponse([], 404); }
        $this->em->remove($m);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }

    #[Route('/marcar-leidos', name: 'api_mensajes_mark_read', methods: ['POST'])]
    public function markRead(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        if (!isset($data['receptor_id'])) {
            return new JsonResponse(['error' => "Falta el campo 'receptor_id'"], 400);
        }
        $receptor = $this->usuarios->find((int) $data['receptor_id']);
        if (!$receptor) {
            return new JsonResponse(['error' => 'Receptor inválido'], 400);
        }
        $criteria = ['receptor' => $receptor];
        if (isset($data['emisor_id'])) {
            $emisor = $this->usuarios->find((int) $data['emisor_id']);
            if (!$emisor) { return new JsonResponse(['error' => 'Emisor inválido'], 400); }
            $criteria['emisor'] = $emisor;
        }
        if (isset($data['figura_id'])) {
            $figura = $this->figuras->find((int) $data['figura_id']);
            // Si figura_id no existe, simplemente ignoramos; marcamos por usuario
            if ($figura) { $criteria['figura'] = $figura; }
        }
        $mensajes = $this->repo->findBy($criteria);
        $updated = 0;
        foreach ($mensajes as $m) {
            if (!$m->isLeido()) {
                $m->setLeido(true);
                $updated++;
            }
        }
        $this->em->flush();
        return new JsonResponse(['updated' => $updated], 200);
    }

    #[Route('/borrar-conversacion', name: 'api_mensajes_delete_conversation', methods: ['POST'])]
    public function deleteConversation(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        // Para coherencia con otros endpoints, aceptamos emisor_id y receptor_id (simétrico)
        foreach (['emisor_id','receptor_id'] as $field) {
            if (!isset($data[$field])) {
                return new JsonResponse(['error' => "Falta el campo '$field'"], 400);
            }
        }
        $a = $this->usuarios->find((int)$data['emisor_id']);
        $b = $this->usuarios->find((int)$data['receptor_id']);
        if (!$a || !$b) { return new JsonResponse(['error' => 'Usuario(s) no válidos'], 400); }

        $qb = $this->repo->createQueryBuilder('m')
            ->where('(m.emisor = :a AND m.receptor = :b) OR (m.emisor = :b AND m.receptor = :a)')
            ->setParameter('a', $a)
            ->setParameter('b', $b);
        if (isset($data['figura_id'])) {
            $fig = $this->figuras->find((int)$data['figura_id']);
            if ($fig) { $qb->andWhere('m.figura = :fig')->setParameter('fig', $fig); }
        }
        $mensajes = $qb->getQuery()->getResult();
        $deleted = 0;
        foreach ($mensajes as $m) { $this->em->remove($m); $deleted++; }
        $this->em->flush();
        return new JsonResponse(['deleted' => $deleted], 200);
    }
}