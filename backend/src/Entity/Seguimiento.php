<?php

namespace App\Entity;

use App\Repository\SeguimientoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SeguimientoRepository::class)]
#[ORM\Table(name: 'seguimientos')]
#[ORM\UniqueConstraint(name: 'uniq_usuario_figura', columns: ['usuario_id','figura_id'])]
class Seguimiento
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $usuario = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Figura $figura = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUsuario(): ?Usuario { return $this->usuario; }
    public function setUsuario(?Usuario $u): self { $this->usuario = $u; return $this; }
    public function getFigura(): ?Figura { return $this->figura; }
    public function setFigura(?Figura $f): self { $this->figura = $f; return $this; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}