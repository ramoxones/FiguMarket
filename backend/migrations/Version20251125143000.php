<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251125143000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Añade columnas destacado_inicio y destacado_fin a figura';
    }

    public function up(Schema $schema): void
    {
        // Compatibles con SQLite y MySQL
        $this->addSql('ALTER TABLE figura ADD destacado_inicio DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE figura ADD destacado_fin DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE figura DROP COLUMN destacado_inicio');
        $this->addSql('ALTER TABLE figura DROP COLUMN destacado_fin');
    }
}