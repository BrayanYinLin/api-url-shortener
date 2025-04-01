export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      tb_link: {
        Row: {
          created_at: string
          link_clicks: number
          link_id: string
          link_index: number
          link_long: string
          link_short: string
          expires_at?: string
        }
        Insert: {
          created_at?: string
          link_clicks?: number
          link_id?: string
          link_index?: number
          link_long: string
          link_short: string
          expires_at?: string
        }
        Update: {
          created_at?: string
          link_clicks?: number
          link_id?: string
          link_index?: number
          link_long?: string
          link_short?: string
          link_expires_at?: string
        }
        Relationships: []
      }
      tb_link_per_user: {
        Row: {
          link_id: string
          user_id: string
        }
        Insert: {
          link_id: string
          user_id: string
        }
        Update: {
          link_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tb_link_link_id_fk'
            columns: ['link_id']
            isOneToOne: false
            referencedRelation: 'tb_link'
            referencedColumns: ['link_id']
          },
          {
            foreignKeyName: 'tb_link_link_id_fk'
            columns: ['link_id']
            isOneToOne: false
            referencedRelation: 'vw_link'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tb_users_user_id_fk'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'tb_users'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'tb_users_user_id_fk'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'vw_user'
            referencedColumns: ['id']
          }
        ]
      }
      tb_provider: {
        Row: {
          provider_id: number
          provider_name: string
        }
        Insert: {
          provider_id?: number
          provider_name: string
        }
        Update: {
          provider_id?: number
          provider_name?: string
        }
        Relationships: []
      }
      tb_users: {
        Row: {
          created_at: string
          provider_id: number
          user_avatar: string
          user_email: string
          user_id: string
          user_index: number
          user_name: string
          user_token: string | null
        }
        Insert: {
          created_at?: string
          provider_id: number
          user_avatar: string
          user_email: string
          user_id?: string
          user_index?: number
          user_name: string
          user_token?: string | null
        }
        Update: {
          created_at?: string
          provider_id?: number
          user_avatar?: string
          user_email?: string
          user_id?: string
          user_index?: number
          user_name?: string
          user_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tb_user_per_provider'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'tb_provider'
            referencedColumns: ['provider_id']
          }
        ]
      }
    }
    Views: {
      vw_link: {
        Row: {
          clicks: number | null
          created_at: string | null
          id: string | null
          long: string | null
          short: string | null
          expires_at: string | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          id?: string | null
          long?: string | null
          short?: string | null
          expires_at?: string | null
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          id?: string | null
          long?: string | null
          short?: string | null
          expires_at?: string | null
        }
        Relationships: []
      }
      vw_link_per_user: {
        Row: {
          clicks: number | null
          created_at: string | null
          link_id: string | null
          long: string | null
          short: string | null
          user_id: string | null
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tb_link_link_id_fk'
            columns: ['link_id']
            isOneToOne: false
            referencedRelation: 'tb_link'
            referencedColumns: ['link_id']
          },
          {
            foreignKeyName: 'tb_link_link_id_fk'
            columns: ['link_id']
            isOneToOne: false
            referencedRelation: 'vw_link'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tb_users_user_id_fk'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'tb_users'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'tb_users_user_id_fk'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'vw_user'
            referencedColumns: ['id']
          }
        ]
      }
      vw_user: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string | null
          id: string | null
          name: string | null
          provider_id: number | null
          provider_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tb_user_per_provider'
            columns: ['provider_id']
            isOneToOne: false
            referencedRelation: 'tb_provider'
            referencedColumns: ['provider_id']
          }
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
