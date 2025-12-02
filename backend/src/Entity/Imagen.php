<?php

namespace App\Entity;

use App\Repository\ImagenRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ImagenRepository::class)]
class Imagen
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'imagenes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Figura $figura = null;

    #[ORM\Column(length: 500)]
    private string $url;

    public function getId(): ?int { return $this->id; }
    public function getFigura(): ?Figura { return $this->figura; }
    public function setFigura(?Figura $figura): self { $this->figura = $figura; return $this; }
    public function getUrl(): string { return $this->url; }
    public function setUrl(string $url): self { $this->url = $url; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'figura_id' => $this->figura?->getId(),
            'url' => $this->url,
        ];
    }
}