<?php

namespace App\Entity;

use App\Repository\ConversacionArchivadaRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ConversacionArchivadaRepository::class)]
#[ORM\Table(name: 'conversacion_archivada')]
#[ORM\UniqueConstraint(name: 'uniq_archivo_owner_otro_figura', columns: ['owner_id','otro_usuario_id','figura_id'])]
class ConversacionArchivada
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'owner_id', referencedColumnName: 'id', nullable: false)]
    private ?Usuario $owner = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'otro_usuario_id', referencedColumnName: 'id', nullable: false)]
    private ?Usuario $otroUsuario = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'figura_id', referencedColumnName: 'id', nullable: true)]
    private ?Figura $figura = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }

    public function getId(): ?int { return $this->id; }
    public function getOwner(): ?Usuario { return $this->owner; }
    public function setOwner(?Usuario $u): self { $this->owner = $u; return $this; }
    public function getOtroUsuario(): ?Usuario { return $this->otroUsuario; }
    public function setOtroUsuario(?Usuario $u): self { $this->otroUsuario = $u; return $this; }
    public function getFigura(): ?Figura { return $this->figura; }
    public function setFigura(?Figura $f): self { $this->figura = $f; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $dt): self { $this->createdAt = $dt; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'owner_id' => $this->owner?->getId(),
            'otro_usuario_id' => $this->otroUsuario?->getId(),
            'figura_id' => $this->figura?->getId(),
            'created_at' => $this->createdAt->format('c'),
        ];
    }
}