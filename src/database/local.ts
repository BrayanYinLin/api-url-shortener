import { Pool } from 'pg'
import { POSTGRES_PASSWORD, POSTGRES_USER } from '../lib/enviroment'
import { Link, Provider, User } from '../types'
import { MissingParameter, UserNotFound } from '../lib/errors'

class Local {
  static instance: Local | null = null
  pool!: Pool

  constructor() {
    if (!Local.instance) {
      this.pool = new Pool({
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        host: 'localhost',
        port: 5273,
        database: 'shortener',
        max: 20
      })

      this.pool.on('error', (err) => {
        console.error('unexpected error on database', err)
        process.exit(-1)
      })

      Local.instance = this
    }

    return Local.instance
  }

  async findUserById({ id }: Pick<User, 'id'>): Promise<User> {
    const client = await this.pool.connect()

    if (!id) {
      throw new MissingParameter('Missing identifier (id)')
    }

    try {
      const {
        rows: [user]
      } = await client.query({
        text: 'SELECT * FROM vw_user WHERE id = $1 LIMIT 1;',
        values: [id]
      })

      if (!user) {
        throw new UserNotFound('User not found by id')
      }

      return {
        id: String(user.id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: {
          provider_id: Number(user.provider_id),
          provider_name: user.provider_name
        },
        created_at: user.created_at
      }
    } finally {
      client.release()
    }
  }

  async findUserByEmail({ email }: Pick<User, 'email'>): Promise<User | null> {
    const client = await this.pool.connect()

    try {
      const {
        rowCount,
        rows: [user]
      } = await client.query({
        text: 'SELECT * FROM vw_user WHERE LOWER(email) = LOWER($1) LIMIT 1',
        values: [email]
      })

      if (!rowCount || rowCount <= 0) {
        return null
      }

      return {
        id: String(user.id),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: {
          provider_id: Number(user.provider_id),
          provider_name: user.provider_name
        },
        created_at: user.created_at
      }
    } finally {
      client.release()
    }
  }

  async createUser({
    provider: { provider_name },
    name,
    avatar,
    email
  }: User): Promise<User> {
    const client = await this.pool.connect()

    try {
      const {
        rows: [provider]
      } = await client.query<Provider>({
        text: 'SELECT provider_id FROM tb_provider WHERE LOWER(provider_name) = LOWER($1) LIMIT 1;',
        values: [provider_name]
      })

      await client.query<User>({
        text: 'INSERT INTO tb_users (user_name, user_email, user_avatar, provider_id) VALUES ($1, $2, $3, $4);',
        values: [name, email, avatar, provider.provider_id]
      })

      const {
        rows: [newUser]
      } = await client.query({
        text: 'SELECT * FROM vw_user WHERE LOWER(email) = LOWER($1) LIMIT 1',
        values: [email]
      })

      return {
        id: String(newUser.id),
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        provider: {
          provider_id: Number(provider.provider_id),
          provider_name: provider.provider_name
        },
        created_at: newUser.created_at
      }
    } finally {
      client.release()
    }
  }

  async findEveryLinksByUser({ id }: Pick<User, 'id'>): Promise<Link[]> {
    const client = await this.pool.connect()

    try {
      const { rows } = await client.query({
        text: 'SELECT * FROM vw_link_per_user WHERE user_id = $1',
        values: [id]
      })

      return rows.map(
        ({ link_id, long, short, clicks, created_at }): Link => ({
          id: String(link_id),
          long,
          short,
          clicks,
          created_at
        })
      )
    } finally {
      client.release()
    }
  }

  async findLinkbyShort({ short }: Pick<Link, 'short'>) {
    const client = await this.pool.connect()

    try {
      const {
        rowCount,
        rows: [link]
      } = await client.query<Link>({
        text: 'SELECT * FROM vw_link WHERE short = $1',
        values: [short]
      })

      if (!rowCount || rowCount === 0) {
        return null
      }

      return link
    } finally {
      client.release()
    }
  }

  async createLink(
    { long, short }: Pick<Link, 'long' | 'short'>,
    { id }: Pick<User, 'id'>
  ) {
    const client = await this.pool.connect()

    try {
      const {
        rows: [inserted]
      } = await client.query<Link>({
        text: 'INSERT INTO tb_link (link_long, link_short) VALUES ($1, $2) RETURNING link_id AS id;',
        values: [long, short]
      })

      await client.query({
        text: 'INSERT INTO tb_link_per_user (user_id, link_id) VALUES ($1, $2)',
        values: [id, inserted.id!]
      })

      const {
        rows: [link]
      } = await client.query({
        text: 'SELECT * FROM vw_link WHERE id = $1',
        values: [inserted.id!]
      })

      return link
    } finally {
      client.release()
    }
  }

  async editLink({ id, long, short }: Link) {
    const client = await this.pool.connect()

    if (!id) {
      throw new MissingParameter('Identifier not provided')
    }

    try {
      await client.query({
        text: 'UPDATE tb_link SET link_long = COALESCE($1, link_long), link_short = COALESCE($2, link_short)  WHERE link_id = $3',
        values: [long, short, id]
      })

      const {
        rows: [link]
      } = await client.query<Link>({
        text: 'SELECT * FROM vw_link WHERE id = $1',
        values: [id!]
      })

      return link
    } finally {
      client.release()
    }
  }
}

export { Local }
