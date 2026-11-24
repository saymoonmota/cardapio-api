export type CategoriaCardapio = 'Aves' | 'Carnes' | 'Peixes' | 'Bebidas' | 'Sobremesas' | 'Petiscos'

export interface Prato {
  id: string
  nome: string
  categoria: CategoriaCardapio
  tempoPreparoMinutos: number
  descricao: string
  imagem: string
  imagemAlt: string
  avisoImagem: string
  creditoImagem: string
  fonteImagem?: string | null
  ingredientes: string[]   // armazenado como JSON no banco
  modoPreparo: string
  acompanhamentos: string[] // armazenado como JSON no banco
  ativo: boolean
  criadoEm?: string
  atualizadoEm?: string
}

export interface PratoRow {
  id: string
  nome: string
  categoria: string
  tempo_preparo_minutos: number
  descricao: string
  imagem: string
  imagem_alt: string
  aviso_imagem: string
  credito_imagem: string
  fonte_imagem: string | null
  ingredientes: string   // JSON string
  modo_preparo: string
  acompanhamentos: string // JSON string
  ativo: number           // SQLite boolean (0/1)
  criado_em: string
  atualizado_em: string
}

export interface Contato {
  id?: number
  nome: string
  email: string
  mensagem: string
  lido: boolean
  criadoEm?: string
}

export interface ContatoRow {
  id: number
  nome: string
  email: string
  mensagem: string
  lido: number
  criado_em: string
}

export interface Admin {
  id: number
  email: string
  senha_hash: string
  criado_em: string
}

export interface JwtPayload {
  adminId: number
  email: string
}

// Extende Request do Express para carregar o admin autenticado
declare global {
  namespace Express {
    interface Request {
      admin?: JwtPayload
    }
  }
}
