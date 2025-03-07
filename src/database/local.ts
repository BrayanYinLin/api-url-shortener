import { Pool } from 'pg'
import { POSTGRES_PASSWORD, POSTGRES_USER } from '../lib/enviroment'
import { Link, Provider, User, Repository } from '../types'
import { NotFoundError, OperationError } from '../lib/errors'

class Local implements Repository<Pool> {
  static instance: Local | null = null
  database!: Pool

  constructor() {
    if (!Local.instance) {
      this.database = new Pool({
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        host: 'localhost',
        port: 5273,
        database: 'shortener',
        max: 20
      })

      this.database.on('error', (err) => {
        console.error('unexpected error on database', err)
        process.exit(-1)
      })

      Local.instance = this
    }

    return Local.instance
  }

  async findUserById({ id }: Required<Pick<User, 'id'>>): Promise<User> {
    const client = await this.database.connect()

    try {
      const {
        rows: [user]
      } = await client.query({
        text: 'SELECT * FROM vw_user WHERE id = $1 LIMIT 1;',
        values: [id]
      })

      if (!user) {
        throw new NotFoundError('User not found by identifier')
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
    const client = await this.database.connect()

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
    const client = await this.database.connect()

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

  async findEveryLinksByUser({
    id
  }: Required<Pick<User, 'id'>>): Promise<Link[]> {
    const client = await this.database.connect()

    try {
      const { rows } = await client.query({
        text: 'SELECT * FROM vw_link_per_user WHERE user_id = $1',
        values: [id]
      })

      return rows.map(
        ({ link_id, long, short, clicks, expires_at, created_at }): Link => ({
          id: String(link_id),
          long,
          short,
          clicks,
          created_at,
          expires_at
        })
      )
    } finally {
      client.release()
    }
  }

  async findLinkbyShort({ short }: Pick<Link, 'short'>) {
    const client = await this.database.connect()

    try {
      const {
        rowCount,
        rows: [link]
      } = await client.query<Link>({
        text: 'SELECT * FROM recover_and_delete() WHERE short = $1',
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
    { long, short, expires_at }: Pick<Link, 'long' | 'short' | 'expires_at'>,
    { id }: Pick<User, 'id'>
  ) {
    const client = await this.database.connect()
    const expiration = expires_at ?? null

    try {
      const {
        rows: [inserted]
      } = await client.query<Link>({
        text: 'INSERT INTO tb_link (link_long, link_short, link_expires_at) VALUES ($1, $2, $3) RETURNING link_id AS id;',
        values: [long, short, expiration]
      })

      await client.query({
        text: 'INSERT INTO tb_link_per_user (user_id, link_id) VALUES ($1, $2)',
        values: [id, inserted.id!]
      })

      const {
        rows: [link]
      } = await client.query<Link>({
        text: 'SELECT * FROM vw_link WHERE id = $1',
        values: [inserted.id!]
      })

      return link
    } finally {
      client.release()
    }
  }

  async editLink({ id, long }: Required<Pick<Link, 'id' | 'long'>>) {
    const client = await this.database.connect()

    try {
      await client.query({
        text: 'UPDATE tb_link SET link_long = COALESCE($1, link_long)  WHERE link_id = $2',
        values: [long, id]
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

  async increaseClickByLink({ id }: Required<Pick<Link, 'id'>>) {
    const client = await this.database.connect()

    try {
      await client.query({
        text: 'UPDATE tb_link SET link_clicks = link_clicks + 1  WHERE link_id = $1',
        values: [id]
      })

      // const {
      //   rows: [link]
      // } = await client.query<Link>({
      //   text: 'SELECT * FROM vw_link WHERE id = $1',
      //   values: [id!]
      // })

      // return link
    } finally {
      client.release()
    }
  }

  async deleteLinkById({ id }: Required<Pick<Link, 'id'>>) {
    const client = await this.database.connect()

    try {
      const { rowCount: connections } = await client.query({
        text: 'DELETE FROM tb_link_per_user WHERE link_id = $1',
        values: [id]
      })

      if (!connections) {
        throw new NotFoundError(
          'Relation between links and user was not deleted'
        )
      }

      const { rowCount: deletedRows } = await client.query({
        text: 'DELETE FROM tb_link WHERE link_id = $1',
        values: [id]
      })

      if (!deletedRows) {
        throw new OperationError('Link was not deleted')
      }

      return { deleted: Boolean(deletedRows) }
    } finally {
      client.release()
    }
  }
}

export { Local }
