<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251121123000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Añade columna estado_figura a figura';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE figura ADD estado_figura VARCHAR(40) NOT NULL DEFAULT 'en buen estado'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE figura DROP COLUMN estado_figura');
    }
}