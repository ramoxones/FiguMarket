<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251123123000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Eliminar tabla transaccion; este modelo deja de usarse.';
    }

    public function up(Schema $schema): void
    {
        $platform = $this->connection->getDatabasePlatform()->getName();
        if ($platform === 'mysql') {
            $this->addSql('DROP TABLE IF EXISTS transaccion');
        } else {
            // SQLite y otros
            $this->addSql('DROP TABLE IF EXISTS transaccion');
        }
    }

    public function down(Schema $schema): void
    {
        // No se restaura la tabla transaccion.
    }
}