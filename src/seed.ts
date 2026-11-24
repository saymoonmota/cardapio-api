/**
 * Popula o banco com o admin padrão e os pratos do frontend original.
 * Execute: npm run seed
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import db from './db'

// ─── Admin ───────────────────────────────────────────────────────────────────

const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@cardapiaui.com'
const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'

const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(adminEmail)
if (!existing) {
  const hash = bcrypt.hashSync(adminPassword, 10)
  db.prepare('INSERT INTO admins (email, senha_hash) VALUES (?, ?)').run(adminEmail, hash)
  console.log(`✔ Admin criado: ${adminEmail}`)
} else {
  console.log(`– Admin já existe: ${adminEmail}`)
}

// ─── Pratos ──────────────────────────────────────────────────────────────────

const pratos = [
  {
    id: 'galinha-caipira',
    nome: 'Galinha Caipira',
    categoria: 'Aves',
    tempoPreparoMinutos: 90,
    descricao: 'Galinha caipira cozida lentamente no molho encorpado com cheiro-verde, pimenta-de-cheiro e açafrão, servida com pirão e arroz branco.',
    imagem: '/images/foto-galinha-caipira.jpg',
    imagemAlt: 'Galinha caipira caseira servida com acompanhamentos',
    avisoImagem: 'Receitas e apresentações podem variar de acordo com cada família.',
    creditoImagem: 'Acervo do grupo',
    fonteImagem: null,
    ingredientes: ['Galinha caipira', 'Alho e cebola', 'Cheiro-verde', 'Pimenta-de-cheiro', 'Açafrão-da-terra'],
    modoPreparo: 'Tempere a galinha e deixe descansar para absorver os sabores. Doure os pedaços, acrescente água aos poucos e cozinhe em fogo baixo até a carne ficar macia e o molho encorpado. Finalize com cheiro-verde.',
    acompanhamentos: ['Pirão', 'Arroz branco', 'Pimenta a gosto'],
  },
  {
    id: 'panelada-piauiense',
    nome: 'Panelada Piauiense',
    categoria: 'Carnes',
    tempoPreparoMinutos: 120,
    descricao: 'Tradicional panelada feita com bucho e mocotó bem temperados, cozidos até ficarem macios, acompanhada de farinha d\'água e pimenta.',
    imagem: '/images/foto-panelada.jpg',
    imagemAlt: 'Panelada piauiense caseira',
    avisoImagem: 'Receitas e apresentações podem variar de acordo com cada família.',
    creditoImagem: 'Acervo do grupo',
    fonteImagem: null,
    ingredientes: ['Bucho bovino', 'Mocotó', 'Alho', 'Cebola', 'Cheiro-verde'],
    modoPreparo: 'Limpe cuidadosamente o bucho e o mocotó. Refogue os temperos, junte as carnes e cubra com água. Cozinhe lentamente até tudo ficar macio, ajustando o sal e finalizando com cheiro-verde.',
    acompanhamentos: ['Farinha d\'água', 'Arroz branco', 'Pimenta'],
  },
  {
    id: 'carne-de-bode',
    nome: 'Carne de Bode',
    categoria: 'Carnes',
    tempoPreparoMinutos: 100,
    descricao: 'Carne de bode assada ou guisada no tempero caseiro do sertão piauiense, servida com baião de dois e macaxeira cozida.',
    imagem: '/images/foto-carne-bode.jpg',
    imagemAlt: 'Carne de bode preparada com temperos caseiros',
    avisoImagem: 'Receitas e apresentações podem variar de acordo com cada família.',
    creditoImagem: 'Acervo do grupo',
    fonteImagem: null,
    ingredientes: ['Carne de bode', 'Alho', 'Cebola', 'Cominho', 'Cheiro-verde'],
    modoPreparo: 'Tempere a carne e deixe marinar. Para a versão guisada, doure os pedaços e cozinhe em panela tampada com um pouco de água até ficarem macios. Para assar, leve ao forno coberto e descubra no final para dourar.',
    acompanhamentos: ['Baião de dois', 'Macaxeira cozida', 'Farofa'],
  },
  {
    id: 'carne-de-sol',
    nome: 'Carne de Sol',
    categoria: 'Carnes',
    tempoPreparoMinutos: 75,
    descricao: 'Carne de sol artesanal acebolada na manteiga da terra, acompanhada de macaxeira frita, paçoca de carne e vinagrete.',
    imagem: '/images/foto-carne-sol.jpg',
    imagemAlt: 'Carne de sol caseira servida com acompanhamentos',
    avisoImagem: 'Receitas e apresentações podem variar de acordo com cada família.',
    creditoImagem: 'Acervo do grupo',
    fonteImagem: null,
    ingredientes: ['Carne de sol', 'Cebola', 'Manteiga da terra', 'Alho'],
    modoPreparo: 'Dessalgue a carne conforme necessário e corte em porções. Aqueça a manteiga da terra, doure a carne e junte a cebola até ficar macia e levemente caramelizada.',
    acompanhamentos: ['Macaxeira frita', 'Paçoca de carne', 'Vinagrete'],
  },
  {
    id: 'peixe-do-piaui',
    nome: 'Piau Frito',
    categoria: 'Peixes',
    tempoPreparoMinutos: 60,
    descricao: 'Piau fresco temperado e frito até ficar dourado, servido com arroz, limão e salada fresca.',
    imagem: '/images/foto-piau-frito.jpg',
    imagemAlt: 'Piau frito servido com acompanhamentos',
    avisoImagem: 'Receitas e apresentações podem variar de acordo com cada família.',
    creditoImagem: 'Acervo do grupo',
    fonteImagem: null,
    ingredientes: ['Piau fresco', 'Alho', 'Limão', 'Sal', 'Óleo para fritura'],
    modoPreparo: 'Tempere o piau com alho, limão e sal e deixe descansar. Seque bem e frite em óleo quente até dourar dos dois lados. Escorra e sirva.',
    acompanhamentos: ['Arroz', 'Limão', 'Salada fresca'],
  },
  {
    id: 'sarapatel',
    nome: 'Sarapatel',
    categoria: 'Carnes',
    tempoPreparoMinutos: 120,
    descricao: 'Sarapatel caseiro preparado com miúdos bem limpos e temperados, cozidos lentamente com alho, cebola, cheiro-verde e pimenta.',
    imagem: '/images/foto-sarapatel.jpg',
    imagemAlt: 'Sarapatel caseiro preparado com temperos',
    avisoImagem: 'Receitas e apresentações podem variar de acordo com cada família.',
    creditoImagem: 'Acervo do grupo',
    fonteImagem: null,
    ingredientes: ['Miúdos (conforme a receita)', 'Alho', 'Cebola', 'Cheiro-verde', 'Pimenta', 'Sal'],
    modoPreparo: 'Limpe bem os miúdos e corte em pedaços. Refogue alho e cebola, junte os miúdos e os temperos e cozinhe em fogo baixo com água até ficarem macios e o caldo encorpado. Ajuste o sal e finalize com cheiro-verde.',
    acompanhamentos: ['Arroz branco', 'Farinha d\'água', 'Pimenta a gosto'],
  },
  {
    id: 'cajuina-piauiense',
    nome: 'Cajuína Piauiense',
    categoria: 'Bebidas',
    tempoPreparoMinutos: 5,
    descricao: 'Bebida tradicional do Piauí, feita do suco de caju clarificado e servida gelada.',
    imagem: '/images/cajuina-teresina.jpg',
    imagemAlt: 'Garrafa de Cajuína Teresina ao lado de cajus frescos',
    avisoImagem: 'Foto enviada pelo usuário; marcas e apresentações da cajuína podem variar.',
    creditoImagem: 'Enviada pelo usuário',
    fonteImagem: null,
    ingredientes: ['Cajuína pronta', 'Gelo (opcional)'],
    modoPreparo: 'Mantenha a cajuína refrigerada e sirva gelada. O gelo é opcional.',
    acompanhamentos: ['Castanha de caju'],
  },
  {
    id: 'doce-de-buriti',
    nome: 'Doce de Buriti',
    categoria: 'Sobremesas',
    tempoPreparoMinutos: 45,
    descricao: 'Doce artesanal feito com polpa de buriti e açúcar, com sabor marcante e textura macia.',
    imagem: '/images/doce-buriti.jpg',
    imagemAlt: 'Embalagem de doce artesanal de buriti comercializado em Inhuma, Piauí',
    avisoImagem: 'Fotografia de doce de buriti comercializado em Inhuma, Piauí.',
    creditoImagem: 'Rapper Ouriço / Wikimedia Commons (domínio público)',
    fonteImagem: 'https://commons.wikimedia.org/wiki/File:Caixa_contendo_doce_de_buriti.jpg',
    ingredientes: ['Polpa de buriti', 'Açúcar', 'Água'],
    modoPreparo: 'Leve a polpa de buriti ao fogo baixo com açúcar e um pouco de água. Mexa até a mistura reduzir e atingir a consistência desejada.',
    acompanhamentos: ['Queijo coalho (opcional)'],
  },
  {
    id: 'doce-de-caju',
    nome: 'Doce de Caju',
    categoria: 'Sobremesas',
    tempoPreparoMinutos: 60,
    descricao: 'Doce caseiro de caju cozido lentamente em calda, tradicional em Campo Maior, no Piauí.',
    imagem: '/images/doce-caju-campo-maior.jpg',
    imagemAlt: 'Doce de caju preparado em Campo Maior, Piauí',
    avisoImagem: 'Doce fotografado em Campo Maior, Piauí.',
    creditoImagem: 'Academia de Letras de Campo Maior / Wikimedia Commons',
    fonteImagem: 'https://commons.wikimedia.org/wiki/File:Doce_de_caju_Campo_Maior_(Piau%C3%AD).JPG',
    ingredientes: ['Caju', 'Açúcar', 'Cravo-da-índia (opcional)'],
    modoPreparo: 'Lave os cajus e retire as castanhas. Cozinhe as frutas em fogo baixo com açúcar e um pouco de água até formar uma calda e o caju ficar macio.',
    acompanhamentos: ['Queijo coalho (opcional)'],
  },
  {
    id: 'castanha-assada',
    nome: 'Castanha Assada',
    categoria: 'Petiscos',
    tempoPreparoMinutos: 20,
    descricao: 'Castanha de caju assada, um petisco crocante que combina com os sabores da região.',
    imagem: '/images/castanha-caju.jpg',
    imagemAlt: 'Castanhas de caju sem casca',
    avisoImagem: 'Foto ilustrativa de castanhas de caju; não mostra a torra.',
    creditoImagem: 'Ranjithkumar Murugesan / Wikimedia Commons (CC0)',
    fonteImagem: 'https://commons.wikimedia.org/wiki/File:CASHEW_NUTS.jpg',
    ingredientes: ['Castanhas de caju sem casca', 'Sal (opcional)'],
    modoPreparo: 'Use castanhas sem casca próprias para consumo. Espalhe em uma assadeira e asse em forno baixo, mexendo regularmente, até ficarem douradas. Tempere no final, se desejar.',
    acompanhamentos: ['Cajuína'],
  },
]

const insert = db.prepare(`
  INSERT OR IGNORE INTO pratos (
    id, nome, categoria, tempo_preparo_minutos,
    descricao, imagem, imagem_alt, aviso_imagem,
    credito_imagem, fonte_imagem, ingredientes,
    modo_preparo, acompanhamentos
  ) VALUES (
    @id, @nome, @categoria, @tempoPreparoMinutos,
    @descricao, @imagem, @imagemAlt, @avisoImagem,
    @creditoImagem, @fonteImagem, @ingredientes,
    @modoPreparo, @acompanhamentos
  )
`)

const seedPratos = db.transaction(() => {
  for (const p of pratos) {
    const result = insert.run({
      ...p,
      ingredientes: JSON.stringify(p.ingredientes),
      acompanhamentos: JSON.stringify(p.acompanhamentos),
    })
    if (result.changes > 0) {
      console.log(`✔ Prato inserido: ${p.nome}`)
    } else {
      console.log(`– Prato já existe: ${p.nome}`)
    }
  }
})

seedPratos()

console.log('\nSeed concluído.')
db.close()
