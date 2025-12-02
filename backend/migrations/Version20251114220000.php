<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251114220000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Crear tabla conversacion_archivada con claves foráneas y restricción única';
    }

    public function up(Schema $schema): void
    {
        $platform = $this->connection->getDatabasePlatform()->getName();
        if ($platform === 'mysql') {
            $this->addSql('CREATE TABLE conversacion_archivada (
                id INT AUTO_INCREMENT NOT NULL,
                owner_id INT NOT NULL,
                otro_usuario_id INT NOT NULL,
                figura_id INT DEFAULT NULL,
                created_at DATETIME NOT NULL,
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            $this->addSql('CREATE INDEX IDX_ARCH_OWNER ON conversacion_archivada (owner_id)');
            $this->addSql('CREATE UNIQUE INDEX uniq_archivo_owner_otro_figura ON conversacion_archivada (owner_id, otro_usuario_id, figura_id)');
            $this->addSql('ALTER TABLE conversacion_archivada ADD CONSTRAINT FK_ARCHIVADA_FIGURA FOREIGN KEY (figura_id) REFERENCES figura (id)');
        } else {
            // SQLite compatible
            $this->addSql('CREATE TABLE conversacion_archivada (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, owner_id INTEGER NOT NULL, otro_usuario_id INTEGER NOT NULL, figura_id INTEGER DEFAULT NULL, created_at DATETIME NOT NULL)');
            $this->addSql('CREATE INDEX IDX_ARCH_OWNER ON conversacion_archivada (owner_id)');
            $this->addSql('CREATE UNIQUE INDEX uniq_archivo_owner_otro_figura ON conversacion_archivada (owner_id, otro_usuario_id, figura_id)');
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE conversacion_archivada');
    }
}