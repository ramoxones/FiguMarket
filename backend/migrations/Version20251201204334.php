<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251201204334 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE conversacion_archivada CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE conversacion_archivada ADD CONSTRAINT FK_ABF2B09A7E3C61F9 FOREIGN KEY (owner_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE conversacion_archivada ADD CONSTRAINT FK_ABF2B09A613C817B FOREIGN KEY (otro_usuario_id) REFERENCES usuario (id)');
        $this->addSql('CREATE INDEX IDX_ABF2B09A613C817B ON conversacion_archivada (otro_usuario_id)');
        $this->addSql('ALTER TABLE conversacion_archivada RENAME INDEX idx_arch_owner TO IDX_ABF2B09A7E3C61F9');
        $this->addSql('ALTER TABLE conversacion_archivada RENAME INDEX fk_archivada_figura TO IDX_ABF2B09A8AA286E2');
        $this->addSql('ALTER TABLE figura ADD destacado TINYINT(1) NOT NULL, CHANGE descripcion descripcion LONGTEXT NOT NULL, CHANGE fecha_publicacion fecha_publicacion DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE estado_figura estado_figura VARCHAR(40) NOT NULL, CHANGE destacado_inicio destacado_inicio DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE destacado_fin destacado_fin DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE mensaje CHANGE contenido contenido LONGTEXT NOT NULL, CHANGE fecha_envio fecha_envio DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE mensaje RENAME INDEX idx_mensaje_figura_id TO IDX_9B631D018AA286E2');
        $this->addSql('DROP INDEX IDX_NOTICIA_CREADA_AT ON noticia');
        $this->addSql('ALTER TABLE seguimientos DROP FOREIGN KEY fk_seguimientos_figura');
        $this->addSql('ALTER TABLE seguimientos DROP FOREIGN KEY fk_seguimientos_usuario');
        $this->addSql('ALTER TABLE seguimientos ADD CONSTRAINT FK_780911CADB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE seguimientos ADD CONSTRAINT FK_780911CA8AA286E2 FOREIGN KEY (figura_id) REFERENCES figura (id)');
        $this->addSql('ALTER TABLE seguimientos RENAME INDEX idx_seguimientos_usuario TO IDX_780911CADB38439E');
        $this->addSql('ALTER TABLE seguimientos RENAME INDEX idx_seguimientos_figura TO IDX_780911CA8AA286E2');
        $this->addSql('ALTER TABLE usuario CHANGE fecha_registro fecha_registro DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE conversacion_archivada DROP FOREIGN KEY FK_ABF2B09A7E3C61F9');
        $this->addSql('ALTER TABLE conversacion_archivada DROP FOREIGN KEY FK_ABF2B09A613C817B');
        $this->addSql('DROP INDEX IDX_ABF2B09A613C817B ON conversacion_archivada');
        $this->addSql('ALTER TABLE conversacion_archivada CHANGE created_at created_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE conversacion_archivada RENAME INDEX idx_abf2b09a8aa286e2 TO FK_ARCHIVADA_FIGURA');
        $this->addSql('ALTER TABLE conversacion_archivada RENAME INDEX idx_abf2b09a7e3c61f9 TO IDX_ARCH_OWNER');
        $this->addSql('ALTER TABLE usuario CHANGE fecha_registro fecha_registro DATETIME NOT NULL');
        $this->addSql('ALTER TABLE seguimientos DROP FOREIGN KEY FK_780911CADB38439E');
        $this->addSql('ALTER TABLE seguimientos DROP FOREIGN KEY FK_780911CA8AA286E2');
        $this->addSql('ALTER TABLE seguimientos ADD CONSTRAINT fk_seguimientos_figura FOREIGN KEY (figura_id) REFERENCES figura (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE seguimientos ADD CONSTRAINT fk_seguimientos_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE seguimientos RENAME INDEX idx_780911ca8aa286e2 TO idx_seguimientos_figura');
        $this->addSql('ALTER TABLE seguimientos RENAME INDEX idx_780911cadb38439e TO idx_seguimientos_usuario');
        $this->addSql('ALTER TABLE figura DROP destacado, CHANGE descripcion descripcion TEXT NOT NULL, CHANGE estado_figura estado_figura VARCHAR(40) DEFAULT \'en buen estado\' NOT NULL, CHANGE destacado_inicio destacado_inicio DATETIME DEFAULT NULL, CHANGE destacado_fin destacado_fin DATETIME DEFAULT NULL, CHANGE fecha_publicacion fecha_publicacion DATETIME NOT NULL');
        $this->addSql('CREATE INDEX IDX_NOTICIA_CREADA_AT ON noticia (creada_at)');
        $this->addSql('ALTER TABLE mensaje CHANGE contenido contenido TEXT NOT NULL, CHANGE fecha_envio fecha_envio DATETIME NOT NULL');
        $this->addSql('ALTER TABLE mensaje RENAME INDEX idx_9b631d018aa286e2 TO IDX_MENSAJE_FIGURA_ID');
    }
}
