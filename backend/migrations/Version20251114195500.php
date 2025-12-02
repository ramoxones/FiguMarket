<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251114195500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Añade columna figura_id opcional a mensajes para separar conversaciones por figura';
    }

    public function up(Schema $schema): void
    {
        // Añadir columna figura_id a mensaje y su FK
        $this->addSql('ALTER TABLE mensaje ADD figura_id INT DEFAULT NULL');
        $this->addSql('CREATE INDEX IDX_MENSAJE_FIGURA_ID ON mensaje (figura_id)');
        $this->addSql('ALTER TABLE mensaje ADD CONSTRAINT FK_MENSAJE_FIGURA FOREIGN KEY (figura_id) REFERENCES figura (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE mensaje DROP FOREIGN KEY FK_MENSAJE_FIGURA');
        $this->addSql('DROP INDEX IDX_MENSAJE_FIGURA_ID ON mensaje');
        $this->addSql('ALTER TABLE mensaje DROP figura_id');
    }
}