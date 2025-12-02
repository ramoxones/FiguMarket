<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251125Seguimientos extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Crear tabla seguimientos (usuario_id, figura_id, created_at) con índice único y FKs';
    }

    public function up(Schema $schema): void
    {
        if ($schema->hasTable('seguimientos')) {
            return;
        }

        $table = $schema->createTable('seguimientos');
        $table->addColumn('id', 'integer', [ 'autoincrement' => true ]);
        $table->addColumn('usuario_id', 'integer', [ 'notnull' => true ]);
        $table->addColumn('figura_id', 'integer', [ 'notnull' => true ]);
        $table->addColumn('created_at', 'datetime_immutable', [ 'notnull' => true ]);
        $table->setPrimaryKey(['id']);
        $table->addUniqueIndex(['usuario_id', 'figura_id'], 'uniq_usuario_figura');

        $table->addIndex(['usuario_id'], 'idx_seguimientos_usuario');
        $table->addIndex(['figura_id'], 'idx_seguimientos_figura');
        $table->addForeignKeyConstraint('usuario', ['usuario_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_seguimientos_usuario');
        $table->addForeignKeyConstraint('figura', ['figura_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_seguimientos_figura');
    }

    public function down(Schema $schema): void
    {
        if ($schema->hasTable('seguimientos')) {
            $schema->dropTable('seguimientos');
        }
    }
}