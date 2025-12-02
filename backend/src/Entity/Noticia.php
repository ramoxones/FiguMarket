<?php

namespace App\Entity;

use App\Repository\NoticiaRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NoticiaRepository::class)]
class Noticia
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $titulo;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $resumen = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $imagen = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $url = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $creadaAt;

    public function __construct()
    {
        $this->creadaAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getTitulo(): string { return $this->titulo; }
    public function setTitulo(string $titulo): self { $this->titulo = $titulo; return $this; }
    public function getResumen(): ?string { return $this->resumen; }
    public function setResumen(?string $resumen): self { $this->resumen = $resumen; return $this; }
    public function getDescripcion(): ?string { return $this->descripcion; }
    public function setDescripcion(?string $descripcion): self { $this->descripcion = $descripcion; return $this; }
    public function getImagen(): ?string { return $this->imagen; }
    public function setImagen(?string $imagen): self { $this->imagen = $imagen; return $this; }
    public function getUrl(): ?string { return $this->url; }
    public function setUrl(?string $url): self { $this->url = $url; return $this; }
    public function getCreadaAt(): \DateTimeImmutable { return $this->creadaAt; }
    public function setCreadaAt(\DateTimeImmutable $fecha): self { $this->creadaAt = $fecha; return $this; }

    public function toArray(): array
    {
        $imagenUrl = $this->imagen;
        // Si es un path relativo, simplemente devolver tal cual. Si es absoluto, también.
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'resumen' => $this->resumen,
            'descripcion' => $this->descripcion,
            'imagen' => $this->imagen,
            'imagen_url' => $imagenUrl,
            'url' => $this->url,
            'creada_at' => $this->creadaAt->format('c'),
        ];
    }
}