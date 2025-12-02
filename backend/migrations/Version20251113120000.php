<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251113120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Crea tabla noticia para gestionar noticias del slider';
    }

    public function up(Schema $schema): void
    {
        // Crear tabla noticia
        $this->addSql('CREATE TABLE noticia (id INT AUTO_INCREMENT NOT NULL, titulo VARCHAR(255) NOT NULL, resumen VARCHAR(255) DEFAULT NULL, descripcion LONGTEXT DEFAULT NULL, imagen VARCHAR(255) DEFAULT NULL, url VARCHAR(255) DEFAULT NULL, creada_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE INDEX IDX_NOTICIA_CREADA_AT ON noticia (creada_at)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE noticia');
    }
}