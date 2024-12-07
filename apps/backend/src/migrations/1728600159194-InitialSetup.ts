import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1728600159194 implements MigrationInterface {
  name = 'InitialSetup1728600159194';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "oauth_providers" ("id" SERIAL NOT NULL, "provider" character varying NOT NULL, "providerId" character varying NOT NULL, "accessToken" character varying NOT NULL, "refreshToken" character varying, "userId" integer, CONSTRAINT "PK_80f70fba4177502d50482d9735b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "email" character varying NOT NULL, "photo" character varying NOT NULL DEFAULT 'assets/images/perfil/default_profile_400x400.png', "firstname" character varying, "lastname" character varying, "maternalname" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_providers" ADD CONSTRAINT "FK_c1d368c479954b39ace75ea1a5b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "oauth_providers" DROP CONSTRAINT "FK_c1d368c479954b39ace75ea1a5b"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "oauth_providers"`);
  }
}
