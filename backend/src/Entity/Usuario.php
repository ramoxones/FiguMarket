<?php

namespace App\Entity;

use App\Repository\UsuarioRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: UsuarioRepository::class)]
class Usuario
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $nombre;

    #[ORM\Column(length: 255, unique: true)]
    private string $email;

    #[ORM\Column(length: 255)]
    private string $contrasena;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $fechaRegistro;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $fotoPerfil = null;

    #[ORM\Column(length: 20)]
    private string $rol;

    #[ORM\OneToMany(mappedBy: 'usuario', targetEntity: Figura::class, cascade: ['persist'])]
    private Collection $figuras;

    #[ORM\OneToMany(mappedBy: 'emisor', targetEntity: Mensaje::class, cascade: ['persist'])]
    private Collection $mensajesEnviados;

    #[ORM\OneToMany(mappedBy: 'receptor', targetEntity: Mensaje::class, cascade: ['persist'])]
    private Collection $mensajesRecibidos;


    public function __construct()
    {
        $this->figuras = new ArrayCollection();
        $this->mensajesEnviados = new ArrayCollection();
        $this->mensajesRecibidos = new ArrayCollection();
        $this->fechaRegistro = new \DateTimeImmutable();
        $this->rol = 'usuario';
    }

    public function getId(): ?int { return $this->id; }
    public function getNombre(): string { return $this->nombre; }
    public function setNombre(string $nombre): self { $this->nombre = $nombre; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): self { $this->email = $email; return $this; }
    public function getContrasena(): string { return $this->contrasena; }
    public function setContrasena(string $contrasena): self { $this->contrasena = $contrasena; return $this; }
    public function getFechaRegistro(): \DateTimeImmutable { return $this->fechaRegistro; }
    public function setFechaRegistro(\DateTimeImmutable $fecha): self { $this->fechaRegistro = $fecha; return $this; }
    public function getFotoPerfil(): ?string { return $this->fotoPerfil; }
    public function setFotoPerfil(?string $fotoPerfil): self { $this->fotoPerfil = $fotoPerfil; return $this; }
    public function getRol(): string { return $this->rol; }
    public function setRol(string $rol): self { $this->rol = $rol; return $this; }

    /** @return Collection<int, Figura> */
    public function getFiguras(): Collection { return $this->figuras; }
    public function addFigura(Figura $figura): self { if(!$this->figuras->contains($figura)){ $this->figuras->add($figura); $figura->setUsuario($this);} return $this; }
    public function removeFigura(Figura $figura): self { $this->figuras->removeElement($figura); if($figura->getUsuario() === $this){ $figura->setUsuario(null);} return $this; }

    /** @return Collection<int, Mensaje> */
    public function getMensajesEnviados(): Collection { return $this->mensajesEnviados; }
    /** @return Collection<int, Mensaje> */
    public function getMensajesRecibidos(): Collection { return $this->mensajesRecibidos; }


    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'email' => $this->email,
            'fecha_registro' => $this->fechaRegistro->format('c'),
            'foto_perfil' => $this->fotoPerfil,
            'rol' => $this->rol,
        ];
    }
}