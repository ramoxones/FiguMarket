<?php

namespace App\Entity;

use App\Repository\FiguraRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: FiguraRepository::class)]
class Figura
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'figuras')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $usuario = null;

    #[ORM\Column(length: 255)]
    private string $nombre;

    #[ORM\Column(type: 'text')]
    private string $descripcion;

    #[ORM\Column(length: 100)]
    private string $categoria;

    #[ORM\Column(length: 50)]
    private string $escala;

    #[ORM\Column(length: 100)]
    private string $estado;

    #[ORM\Column(name: 'estado_figura', length: 40)]
    private string $estadoFigura = 'en buen estado';

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $precio;

    #[ORM\Column(type: 'boolean')]
    private bool $disponible = true;

    #[ORM\Column(type: 'boolean')]
    private bool $destacado = false;

    #[ORM\Column(name: 'destacado_inicio', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $destacadoInicio = null;

    #[ORM\Column(name: 'destacado_fin', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $destacadoFin = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $fechaPublicacion;

    #[ORM\OneToMany(mappedBy: 'figura', targetEntity: Imagen::class, cascade: ['persist', 'remove'])]
    private Collection $imagenes;


    public function __construct()
    {
        $this->imagenes = new ArrayCollection();
        $this->fechaPublicacion = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUsuario(): ?Usuario { return $this->usuario; }
    public function setUsuario(?Usuario $usuario): self { $this->usuario = $usuario; return $this; }
    public function getNombre(): string { return $this->nombre; }
    public function setNombre(string $nombre): self { $this->nombre = $nombre; return $this; }
    public function getDescripcion(): string { return $this->descripcion; }
    public function setDescripcion(string $descripcion): self { $this->descripcion = $descripcion; return $this; }
    public function getCategoria(): string { return $this->categoria; }
    public function setCategoria(string $categoria): self { $this->categoria = $categoria; return $this; }
    public function getEscala(): string { return $this->escala; }
    public function setEscala(string $escala): self { $this->escala = $escala; return $this; }
    public function getEstado(): string { return $this->estado; }
    public function setEstado(string $estado): self { $this->estado = $estado; return $this; }
    public function getEstadoFigura(): string { return $this->estadoFigura; }
    public function setEstadoFigura(string $estadoFigura): self { $this->estadoFigura = $estadoFigura; return $this; }
    public function getPrecio(): string { return $this->precio; }
    public function setPrecio(string $precio): self { $this->precio = $precio; return $this; }
    public function isDisponible(): bool { return $this->disponible; }
    public function setDisponible(bool $disponible): self { $this->disponible = $disponible; return $this; }
    public function isDestacado(): bool { return $this->destacado; }
    public function setDestacado(bool $destacado): self { $this->destacado = $destacado; return $this; }
    public function getDestacadoInicio(): ?\DateTimeImmutable { return $this->destacadoInicio; }
    public function setDestacadoInicio(?\DateTimeImmutable $dt): self { $this->destacadoInicio = $dt; return $this; }
    public function getDestacadoFin(): ?\DateTimeImmutable { return $this->destacadoFin; }
    public function setDestacadoFin(?\DateTimeImmutable $dt): self { $this->destacadoFin = $dt; return $this; }
    public function getFechaPublicacion(): \DateTimeImmutable { return $this->fechaPublicacion; }
    public function setFechaPublicacion(\DateTimeImmutable $fecha): self { $this->fechaPublicacion = $fecha; return $this; }
    /** @return Collection<int, Imagen> */
    public function getImagenes(): Collection { return $this->imagenes; }
    public function addImagen(Imagen $imagen): self { if(!$this->imagenes->contains($imagen)){ $this->imagenes->add($imagen); $imagen->setFigura($this);} return $this; }
    public function removeImagen(Imagen $imagen): self { $this->imagenes->removeElement($imagen); if($imagen->getFigura() === $this){ $imagen->setFigura(null);} return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario?->getId(),
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'categoria' => $this->categoria,
            'escala' => $this->escala,
            'estado' => $this->estado,
            'estado_figura' => $this->estadoFigura,
            'precio' => $this->precio,
            'disponible' => $this->disponible,
            'destacado' => $this->destacado,
            'destacado_inicio' => $this->destacadoInicio?->format('c'),
            'destacado_fin' => $this->destacadoFin?->format('c'),
            'fecha_publicacion' => $this->fechaPublicacion->format('c'),
            'imagenes' => array_map(fn($img) => $img->toArray(), $this->imagenes->toArray()),
        ];
    }
}