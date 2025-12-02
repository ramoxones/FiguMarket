<?php

namespace App\Entity;

use App\Repository\MensajeRepository;
use App\Entity\Figura;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MensajeRepository::class)]
class Mensaje
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'mensajesEnviados')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $emisor = null;

    #[ORM\ManyToOne(inversedBy: 'mensajesRecibidos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $receptor = null;

    #[ORM\Column(type: 'text')]
    private string $contenido;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $fechaEnvio;

    #[ORM\Column(type: 'boolean')]
    private bool $leido = false;

    #[ORM\ManyToOne]
    private ?Figura $figura = null;

    public function __construct()
    {
        $this->fechaEnvio = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getEmisor(): ?Usuario { return $this->emisor; }
    public function setEmisor(?Usuario $emisor): self { $this->emisor = $emisor; return $this; }
    public function getReceptor(): ?Usuario { return $this->receptor; }
    public function setReceptor(?Usuario $receptor): self { $this->receptor = $receptor; return $this; }
    public function getContenido(): string { return $this->contenido; }
    public function setContenido(string $contenido): self { $this->contenido = $contenido; return $this; }
    public function getFechaEnvio(): \DateTimeImmutable { return $this->fechaEnvio; }
    public function setFechaEnvio(\DateTimeImmutable $fechaEnvio): self { $this->fechaEnvio = $fechaEnvio; return $this; }
    public function isLeido(): bool { return $this->leido; }
    public function setLeido(bool $leido): self { $this->leido = $leido; return $this; }

    public function getFigura(): ?Figura { return $this->figura; }
    public function setFigura(?Figura $figura): self { $this->figura = $figura; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'emisor_id' => $this->emisor?->getId(),
            'receptor_id' => $this->receptor?->getId(),
            'figura_id' => $this->figura?->getId(),
            'contenido' => $this->contenido,
            'fecha_envio' => $this->fechaEnvio->format('c'),
            'leido' => $this->leido,
        ];
    }
}