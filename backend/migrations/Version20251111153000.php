<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251111153000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Inicial schema para Usuario, Figura, Imagen, Mensaje, Transaccion en MySQL';
    }

    public function up(Schema $schema): void
    {
        // Usuario
        $this->addSql('CREATE TABLE usuario (
            id INT AUTO_INCREMENT NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            contrasena VARCHAR(255) NOT NULL,
            fecha_registro DATETIME NOT NULL,
            foto_perfil VARCHAR(255) DEFAULT NULL,
            rol VARCHAR(20) NOT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2265B05DE7927C74 ON usuario (email)');

        // Figura
        $this->addSql('CREATE TABLE figura (
            id INT AUTO_INCREMENT NOT NULL,
            usuario_id INT NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT NOT NULL,
            categoria VARCHAR(100) NOT NULL,
            escala VARCHAR(50) NOT NULL,
            estado VARCHAR(100) NOT NULL,
            precio NUMERIC(10, 2) NOT NULL,
            disponible TINYINT(1) NOT NULL,
            fecha_publicacion DATETIME NOT NULL,
            INDEX IDX_283A7763DB38439E (usuario_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE figura ADD CONSTRAINT FK_283A7763DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)');

        // Imagen
        $this->addSql('CREATE TABLE imagen (
            id INT AUTO_INCREMENT NOT NULL,
            figura_id INT NOT NULL,
            url VARCHAR(500) NOT NULL,
            INDEX IDX_8319D2B38AA286E2 (figura_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE imagen ADD CONSTRAINT FK_8319D2B38AA286E2 FOREIGN KEY (figura_id) REFERENCES figura (id)');

        // Mensaje
        $this->addSql('CREATE TABLE mensaje (
            id INT AUTO_INCREMENT NOT NULL,
            emisor_id INT NOT NULL,
            receptor_id INT NOT NULL,
            contenido TEXT NOT NULL,
            fecha_envio DATETIME NOT NULL,
            leido TINYINT(1) NOT NULL,
            INDEX IDX_9B631D016BDF87DF (emisor_id),
            INDEX IDX_9B631D01386D8D01 (receptor_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE mensaje ADD CONSTRAINT FK_9B631D016BDF87DF FOREIGN KEY (emisor_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE mensaje ADD CONSTRAINT FK_9B631D01386D8D01 FOREIGN KEY (receptor_id) REFERENCES usuario (id)');

        // Transaccion
        $this->addSql('CREATE TABLE transaccion (
            id INT AUTO_INCREMENT NOT NULL,
            comprador_id INT NOT NULL,
            vendedor_id INT NOT NULL,
            figura_id INT NOT NULL,
            fecha DATETIME NOT NULL,
            precio_final NUMERIC(10, 2) NOT NULL,
            INDEX IDX_BFF96AF7200A5E25 (comprador_id),
            INDEX IDX_BFF96AF78361A8B8 (vendedor_id),
            UNIQUE INDEX UNIQ_BFF96AF78AA286E2 (figura_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE transaccion ADD CONSTRAINT FK_BFF96AF7200A5E25 FOREIGN KEY (comprador_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE transaccion ADD CONSTRAINT FK_BFF96AF78361A8B8 FOREIGN KEY (vendedor_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE transaccion ADD CONSTRAINT FK_BFF96AF78AA286E2 FOREIGN KEY (figura_id) REFERENCES figura (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE figura DROP FOREIGN KEY FK_283A7763DB38439E');
        $this->addSql('ALTER TABLE imagen DROP FOREIGN KEY FK_8319D2B38AA286E2');
        $this->addSql('ALTER TABLE mensaje DROP FOREIGN KEY FK_9B631D016BDF87DF');
        $this->addSql('ALTER TABLE mensaje DROP FOREIGN KEY FK_9B631D01386D8D01');
        $this->addSql('ALTER TABLE transaccion DROP FOREIGN KEY FK_BFF96AF7200A5E25');
        $this->addSql('ALTER TABLE transaccion DROP FOREIGN KEY FK_BFF96AF78361A8B8');
        $this->addSql('ALTER TABLE transaccion DROP FOREIGN KEY FK_BFF96AF78AA286E2');
        $this->addSql('DROP TABLE transaccion');
        $this->addSql('DROP TABLE mensaje');
        $this->addSql('DROP TABLE imagen');
        $this->addSql('DROP TABLE figura');
        $this->addSql('DROP TABLE usuario');
    }
}