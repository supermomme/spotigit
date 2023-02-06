import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', function (table) {
    table.string('spotify_country')
    table.string('spotify_display_name')
    table.string('spotify_email')
    table.string('spotify_explicit_content_filter_enabled')
    table.string('spotify_explicit_content_filter_locked')
    table.string('spotify_external_urls_spotify')
    table.string('spotify_followers_href')
    table.integer('spotify_followers_total')
    table.string('spotify_href')
    table.specificType('spotify_images', 'jsonb[]')
    table.string('spotify_product')
    table.string('spotify_type')
    table.string('spotify_uri')

    table.string('spotify_access_token')
    table.string('spotify_refresh_token')

    table.bigint('createdAt')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', function (table) {
    table.dropColumn('spotify_country')
    table.dropColumn('spotify_display_name')
    table.dropColumn('spotify_email')
    table.dropColumn('spotify_explicit_content_filter_enabled')
    table.dropColumn('spotify_explicit_content_filter_locked')
    table.dropColumn('spotify_external_urls_spotify')
    table.dropColumn('spotify_followers_href')
    table.dropColumn('spotify_followers_total')
    table.dropColumn('spotify_href')
    table.dropColumn('spotify_images')
    table.dropColumn('spotify_product')
    table.dropColumn('spotify_type')
    table.dropColumn('spotify_uri')

    table.dropColumn('spotify_access_token')
    table.dropColumn('spotify_refresh_token')

    table.dropColumn('createdAt')
  })
}

