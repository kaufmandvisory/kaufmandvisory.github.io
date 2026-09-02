(() => {
  'use strict';

  const ROUTES = [
    {key:'mercados',label:'Mercados',path:'/mercados/',code:'DATA',description:'Precios, variaciones, gas y métricas conectadas.',tone:'auto'},
    {key:'regulacion',label:'Regulación',path:'/regulacion/',code:'LAW',description:'Leyes, consultas y guías por estado jurídico.',tone:'verified'},
    {key:'tokenizacion',label:'Tokenización',path:'/tokenizacion/',code:'RWA',description:'Entidades, iniciativas, redes y madurez verificable.',tone:'auto'},
    {key:'empresas',label:'Empresas',path:'/empresas/',code:'CORP',description:'Actividad, exposición y proyectos blockchain.',tone:'auto'},
    {key:'bancos',label:'Bancos',path:'/bancos/',code:'BANK',description:'Custodia, pagos, tokenización y acceso.',tone:'verified'},
    {key:'exchanges',label:'Exchanges',path:'/exchanges/',code:'CEX',description:'Jurisdicción, licencias, comisiones y custodia.',tone:'auto'},
    {key:'wallets',label:'Wallets',path:'/wallets/',code:'KEYS',description:'Custodia, redes, seguridad y compatibilidad.',tone:'auto'},
    {key:'proyectos',label:'Proyectos',path:'/proyectos/',code:'BUILD',description:'Redes, protocolos, actividad y gobernanza.',tone:'auto'},
    {key:'mineria',label:'Minería',path:'/mineria/',code:'POW',description:'Red, dificultad, energía y economía minera.',tone:'auto'},
    {key:'hardware',label:'Hardware',path:'/hardware/',code:'ASIC',description:'Equipos, eficiencia, algoritmos y disponibilidad.',tone:'verified'},
    {key:'fiscal',label:'Fiscal',path:'/fiscal/',code:'TAX',description:'Hechos fiscales blockchain comparados por jurisdicción, evento y nivel de certeza.',tone:'auto'}
  ];

  const MISSING_VALUE = 'No cubierto por esta fuente';
  const CATALOGS = {
    regulacion:{
      label:'Regulación',description:'Estados jurídicos, fechas de aplicación y fuentes primarias. La automatización detecta; la revisión jurídica verifica.',
      items:[
        {id:'mica-union-europea',name:'MiCA · Unión Europea',subtitle:'Reglamento (UE) 2023/1114 · en vigor',status:'verified',checked:'13 jul 2026',source:{name:'EUR-Lex',url:'https://eur-lex.europa.eu/eli/reg/2023/1114/oj?locale=es',type:'Texto legal primario'},fields:{'Estado':'En vigor','Autoridad':'Autoridades nacionales · ESMA · EBA','Aplicación':'ART y EMT desde 30 jun 2024; régimen general desde 30 dic 2024','Alcance':'Emisores, ofertas, admisión y proveedores de servicios de criptoactivos'}},
        {id:'mica-espana-2026',name:'MiCA · España',subtitle:'Fin del periodo transitorio · 1 jul 2026',status:'verified',checked:'13 jul 2026',source:{name:'CNMV',url:'https://www.cnmv.es/Portal/mica/regulacion-criptoactivos?lang=es',type:'Guía oficial'},fields:{'Estado':'Periodo transitorio finalizado','Autoridad':'CNMV · Banco de España','Vigencia':'Desde 1 jul 2026','Alcance':'CASP que prestan servicios en España; verificación individual en registro MiCA'}},
        {id:'mexico-activos-virtuales',name:'Activos virtuales · México',subtitle:'Ley Fintech y Circular 4/2019 · vigentes',status:'verified',checked:'13 jul 2026',source:{name:'Cámara de Diputados',url:'https://www.diputados.gob.mx/LeyesBiblio/pdf/LRITF.pdf',type:'Texto legal consolidado'},fields:{'Estado':'En vigor','Autoridad':'CNBV · Banco de México','Vigencia':'Ley vigente; última reforma 14 nov 2025','Alcance':'ITF e instituciones de crédito dentro de las operaciones reguladas'}},
        {id:'emiratos-payment-tokens',name:'Payment tokens · EAU',subtitle:'Reglamento federal · en vigor',status:'verified',checked:'13 jul 2026',source:{name:'Central Bank of the UAE',url:'https://rulebook.centralbank.ae/en/rulebook/payment-token-services-regulation',type:'Rulebook oficial'},fields:{'Estado':'En vigor','Autoridad':'Central Bank of the UAE','Vigencia':'Desde 31 ago 2024','Alcance':'Emisión, conversión, custodia y transferencia de payment tokens'}},
        {id:'dubai-vara',name:'Activos virtuales · Dubái',subtitle:'VARA · excepto DIFC',status:'verified',checked:'13 jul 2026',source:{name:'VARA',url:'https://rulebooks.vara.ae/rulebook/virtual-assets-and-related-activities-regulations-2023',type:'Rulebook oficial'},fields:{'Estado':'En vigor','Autoridad':'Virtual Assets Regulatory Authority','Vigencia':'Versión vigente desde 19 jun 2025','Alcance':'Mainland y free zones de Dubái, salvo DIFC'}}
      ]
    },
    fiscal:{label:'Fiscal',description:'Hechos fiscales blockchain comparados por jurisdicción, evento, fuente oficial y nivel de certeza.',items:[
      {id:'espana',name:'España',subtitle:'Persona física · inversión',status:'verified',source:{name:'Agencia Tributaria',url:'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c11-ganancias-perdidas-patrimoniales/monedas-virtuales/compra-venta-monedas-virtuales-tributacion-inversor.html',type:'Guía administrativa oficial'},fields:{'Venta y permuta':'Ganancia o pérdida patrimonial','Tenencia exterior':'Puede activar Modelo 721','Cobertura':'IRPF · inversión fuera de actividad','Revisión jurídica':'13 jul 2026'}},
      {id:'portugal',name:'Portugal',subtitle:'Pessoa singular · criptoativo',status:'verified',source:{name:'Autoridade Tributária',url:'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs10.aspx',type:'Código do IRS consolidado'},fields:{'Venta':'Tratamiento condicionado por 365 días','Permuta cripto':'Diferimiento bajo condiciones','Cobertura':'Categoria G · persona singular','Revisión jurídica':'13 jul 2026'}},
      {id:'estados-unidos',name:'Estados Unidos',subtitle:'Impuesto federal',status:'verified',source:{name:'Internal Revenue Service',url:'https://www.irs.gov/filing/digital-assets',type:'Guía administrativa oficial'},fields:{'Venta y permuta':'Disposición de propiedad','Staking y minería':'Ingreso ordinario según el hecho','Reporte':'Form 8949 · Schedule D · 1099-DA','Límite':'Excluye impuestos estatales'}},
      {id:'emiratos-arabes-unidos',name:'Emiratos Árabes Unidos',subtitle:'Persona física · marco federal',status:'verified',source:{name:'Federal Tax Authority',url:'https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics/basis.of.taxation.natural.person.aspx',type:'Guía administrativa oficial'},fields:{'Inversión personal':'Fuera de business activity para Corporate Tax','Actividad':'Depende de hechos y volumen de negocio','Minería':'Análisis CT y VAT separado','Revisión jurídica':'13 jul 2026'}},
      {id:'argentina',name:'Argentina',subtitle:'Persona humana · marco nacional',status:'verified',source:{name:'ARCA',url:'https://arca.gob.ar/economia-digital/criptoactivos/impuesto-a-las-ganancias.asp',type:'Guía administrativa oficial'},fields:{'Venta y permuta':'Enajenación alcanzada','Minería':'Renta gravada según actividad','Tenencia':'Bienes Personales bajo condiciones','Revisión jurídica':'13 jul 2026'}},
      {id:'colombia',name:'Colombia',subtitle:'Persona natural · reglas generales',status:'verified',source:{name:'DIAN',url:'https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_18075_2023.htm',type:'Concepto unificado oficial'},fields:{'Clasificación':'Activo intangible','Venta y permuta':'Ingreso según reglas generales','Tenencia':'Información patrimonial','Revisión jurídica':'13 jul 2026'}},
      {id:'chile',name:'Chile',subtitle:'Persona natural · marco nacional',status:'verified',source:{name:'Servicio de Impuestos Internos',url:'https://www.sii.cl/preguntas_frecuentes/criptomonedas/001_250_7833.htm',type:'Guía administrativa oficial'},fields:{'Venta':'Renta por diferencia de valor','IVA':'Bien incorporal · tratamiento específico','Reporte':'F1964 para sujetos obligados','Revisión jurídica':'13 jul 2026'}},
      {id:'mexico',name:'México',subtitle:'Criterio interpretativo',status:'unverified',source:{name:'PRODECON',url:'https://www.prodecon.gob.mx/Documentos/bannerPrincipal/2021/CRIPTOMONEDAS_.pdf',type:'Estudio oficial no vinculante'},fields:{'Venta':'Análisis como enajenación de bienes','Permuta':'No determinada en la fuente','Staking':'No determinado','Nivel de certeza':'Interpretativo · revisión necesaria'}}
    ]},
    empresas:{label:'Empresas',description:'Actividad corporativa y exposición descritas desde registros regulatorios o fuentes corporativas primarias.',items:[
      {id:'coinbase',name:'Coinbase',subtitle:'Compañía cotizada · infraestructura',status:'auto',source:{name:'SEC EDGAR',url:'https://data.sec.gov/submissions/CIK0001679788.json',type:'Registro de filings'},fields:{'Entidad':'Coinbase Global, Inc.','Mercado':'Nasdaq · COIN','Actividad':'Exchange, custodia e infraestructura','Control':'Filings SEC monitorizados'}},
      {id:'strategy',name:'Strategy',subtitle:'Compañía cotizada · tesorería Bitcoin',status:'auto',source:{name:'SEC EDGAR',url:'https://data.sec.gov/submissions/CIK0001050446.json',type:'Registro de filings'},fields:{'Entidad':'Strategy Inc.','Mercado':'Nasdaq · MSTR','Actividad':'Software empresarial y estrategia de tesorería Bitcoin','Control':'Filings SEC monitorizados'}},
      {id:'consensys',name:'Consensys',subtitle:'Empresa privada · infraestructura Ethereum',status:'verified',source:{name:'Consensys',url:'https://consensys.io/',type:'Fuente corporativa primaria'},fields:{'Actividad':'Infraestructura y software Ethereum','Productos':'MetaMask · Infura · Linea · clientes de protocolo','Tipo':'Empresa privada','Límite':'La fuente corporativa no sustituye estados auditados'}}
    ]},
    bancos:{label:'Bancos',description:'Los 25 mayores grupos bancarios del mundo por activos, comparados con una misma estructura de escala, sede y actividad blockchain pública.',items:[
      {id:'icbc',name:'Industrial and Commercial Bank of China',subtitle:'China · banco universal',status:'sourcechecked',bank:{rank:1,assets:7645.80,country:'China',region:'Asia-Pacífico',activity:'Infraestructura e-CNY',activityLevel:'Participación publicada',custody:'No verificada como servicio público',access:'Mercado doméstico'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'1','Activos totales':'7.645,80 mil millones US$','Sede':'China','Actividad blockchain pública':'Infraestructura bancaria vinculada al e-CNY','Custodia de criptoactivos':'No verificada como servicio público en este corte','Acceso':'Mercado doméstico y empresas','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'agricultural-bank-china',name:'Agricultural Bank of China',subtitle:'China · banco universal',status:'sourcechecked',bank:{rank:2,assets:6974.82,country:'China',region:'Asia-Pacífico',activity:'Infraestructura e-CNY',activityLevel:'Participación publicada',custody:'No verificada como servicio público',access:'Mercado doméstico'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'2','Activos totales':'6.974,82 mil millones US$','Sede':'China','Actividad blockchain pública':'Infraestructura bancaria vinculada al e-CNY','Custodia de criptoactivos':'No verificada como servicio público en este corte','Acceso':'Mercado doméstico y empresas','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'china-construction-bank',name:'China Construction Bank',subtitle:'China · banco universal',status:'sourcechecked',bank:{rank:3,assets:6524.05,country:'China',region:'Asia-Pacífico',activity:'Infraestructura e-CNY',activityLevel:'Participación publicada',custody:'No verificada como servicio público',access:'Mercado doméstico'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'3','Activos totales':'6.524,05 mil millones US$','Sede':'China','Actividad blockchain pública':'Infraestructura bancaria vinculada al e-CNY','Custodia de criptoactivos':'No verificada como servicio público en este corte','Acceso':'Mercado doméstico y empresas','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'bank-of-china',name:'Bank of China',subtitle:'China · banco universal internacional',status:'sourcechecked',bank:{rank:4,assets:5484.11,country:'China',region:'Asia-Pacífico',activity:'Infraestructura e-CNY',activityLevel:'Participación publicada',custody:'No verificada como servicio público',access:'Doméstico e internacional'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'4','Activos totales':'5.484,11 mil millones US$','Sede':'China','Actividad blockchain pública':'Infraestructura bancaria vinculada al e-CNY','Custodia de criptoactivos':'No verificada como servicio público en este corte','Acceso':'Doméstico e internacional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'jpmorgan-chase',name:'JPMorgan Chase',subtitle:'Estados Unidos · banca universal e inversión',status:'sourcechecked',bank:{rank:5,assets:4424.90,country:'Estados Unidos',region:'América',activity:'Kinexys',activityLevel:'Infraestructura en producción',custody:'Custodia institucional y activos tokenizados',access:'Institucional'},source:{name:'J.P. Morgan · Kinexys',url:'https://www.jpmorgan.com/onyx',type:'Producto corporativo primario'},sources:[{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},{name:'J.P. Morgan · Kinexys',url:'https://www.jpmorgan.com/onyx',type:'Producto corporativo primario'}],fields:{'Puesto mundial':'5','Activos totales':'4.424,90 mil millones US$','Sede':'Estados Unidos','Actividad blockchain pública':'Kinexys · pagos, depósitos y activos tokenizados','Custodia de criptoactivos':'Custodia institucional y soporte de activos tokenizados','Acceso':'Clientes institucionales elegibles','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'bank-of-america',name:'Bank of America',subtitle:'Estados Unidos · banca universal',status:'sourcechecked',bank:{rank:6,assets:3411.74,country:'Estados Unidos',region:'América',activity:'Sin producto vinculado',activityLevel:'Cobertura pendiente',custody:'No verificada como servicio público',access:'Sin alcance digital publicado'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'6','Activos totales':'3.411,74 mil millones US$','Sede':'Estados Unidos','Actividad blockchain pública':'Sin producto operativo enlazado a fuente primaria en este corte','Custodia de criptoactivos':'No verificada como servicio público','Acceso':'Sin alcance digital publicado','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'bnp-paribas',name:'BNP Paribas',subtitle:'Francia · banca universal e institucional',status:'sourcechecked',bank:{rank:7,assets:3279.30,country:'Francia',region:'Europa',activity:'Activos digitales institucionales',activityLevel:'Iniciativas publicadas',custody:'Servicios institucionales bajo alcance',access:'Institucional'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'7','Activos totales':'3.279,30 mil millones US$','Sede':'Francia','Actividad blockchain pública':'Emisión y liquidación de activos digitales en iniciativas institucionales','Custodia de criptoactivos':'Alcance sujeto a entidad y servicio contratado','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'hsbc',name:'HSBC Holdings',subtitle:'Reino Unido · banca universal internacional',status:'sourcechecked',bank:{rank:8,assets:3212.00,country:'Reino Unido',region:'Europa',activity:'HSBC Orion',activityLevel:'Plataforma institucional',custody:'Custodia digital institucional',access:'Institucional'},source:{name:'HSBC Orion',url:'https://www.hsbc.com/who-we-are/our-businesses-and-customers/hsbc-orion',type:'Plataforma corporativa primaria'},sources:[{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},{name:'HSBC Orion',url:'https://www.hsbc.com/who-we-are/our-businesses-and-customers/hsbc-orion',type:'Plataforma corporativa primaria'}],fields:{'Puesto mundial':'8','Activos totales':'3.212,00 mil millones US$','Sede':'Reino Unido','Actividad blockchain pública':'HSBC Orion · emisión y operativa de valores digitales','Custodia de criptoactivos':'Custodia digital institucional según producto y jurisdicción','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'credit-agricole',name:'Crédit Agricole Group',subtitle:'Francia · banca universal y custodia',status:'sourcechecked',bank:{rank:9,assets:3148.91,country:'Francia',region:'Europa',activity:'CACEIS Digital Assets',activityLevel:'Servicios institucionales',custody:'Custodia institucional',access:'Institucional'},source:{name:'CACEIS · Digital Assets',url:'https://www.caceis.com/whats-new/news/spotlight/article/caceis-bank-registered-as-a-digital-assets-service-provider/detail.html',type:'Comunicado corporativo primario'},sources:[{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},{name:'CACEIS · Digital Assets',url:'https://www.caceis.com/whats-new/news/spotlight/article/caceis-bank-registered-as-a-digital-assets-service-provider/detail.html',type:'Comunicado corporativo primario'}],fields:{'Puesto mundial':'9','Activos totales':'3.148,91 mil millones US$','Sede':'Francia','Actividad blockchain pública':'CACEIS · servicios para activos digitales','Custodia de criptoactivos':'Custodia institucional mediante entidad del grupo','Acceso':'Institucional y gestores de activos','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'postal-savings-bank-china',name:'Postal Savings Bank of China',subtitle:'China · banca minorista',status:'sourcechecked',bank:{rank:10,assets:2671.00,country:'China',region:'Asia-Pacífico',activity:'Infraestructura e-CNY',activityLevel:'Participación publicada',custody:'No verificada como servicio público',access:'Mercado doméstico'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'10','Activos totales':'2.671,00 mil millones US$','Sede':'China','Actividad blockchain pública':'Infraestructura bancaria vinculada al e-CNY','Custodia de criptoactivos':'No verificada como servicio público','Acceso':'Mercado doméstico','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'mufg',name:'Mitsubishi UFJ Financial Group',subtitle:'Japón · banca universal',status:'sourcechecked',bank:{rank:11,assets:2666.71,country:'Japón',region:'Asia-Pacífico',activity:'Progmat',activityLevel:'Infraestructura tokenizada',custody:'Servicios mediante socios y entidades',access:'Institucional'},source:{name:'MUFG · Digital Assets',url:'https://www.mufg.jp/english/profile/strategy/dx/digital_asset/index.html',type:'Fuente corporativa primaria'},sources:[{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},{name:'MUFG · Digital Assets',url:'https://www.mufg.jp/english/profile/strategy/dx/digital_asset/index.html',type:'Fuente corporativa primaria'}],fields:{'Puesto mundial':'11','Activos totales':'2.666,71 mil millones US$','Sede':'Japón','Actividad blockchain pública':'Progmat · infraestructura para valores y activos tokenizados','Custodia de criptoactivos':'Alcance institucional mediante entidades y socios','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'citigroup',name:'Citigroup',subtitle:'Estados Unidos · banca universal e institucional',status:'sourcechecked',bank:{rank:12,assets:2622.20,country:'Estados Unidos',region:'América',activity:'Citi Token Services',activityLevel:'Servicio institucional',custody:'Servicios institucionales sujetos a alcance',access:'Institucional'},source:{name:'Citi Token Services',url:'https://www.citigroup.com/global/news/press-release/2023/citi-develops-digital-asset-capabilities-for-institutional-clients',type:'Comunicado corporativo primario'},sources:[{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},{name:'Citi Token Services',url:'https://www.citigroup.com/global/news/press-release/2023/citi-develops-digital-asset-capabilities-for-institutional-clients',type:'Comunicado corporativo primario'}],fields:{'Puesto mundial':'12','Activos totales':'2.622,20 mil millones US$','Sede':'Estados Unidos','Actividad blockchain pública':'Citi Token Services · depósitos tokenizados y trade finance','Custodia de criptoactivos':'Servicios institucionales sujetos a entidad y producto','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'banco-santander',name:'Banco Santander',subtitle:'España · banca universal internacional',status:'sourcechecked',bank:{rank:13,assets:2251.97,country:'España',region:'Europa',activity:'Emisión de bonos tokenizados',activityLevel:'Operaciones publicadas',custody:'No ofrecida como servicio minorista general',access:'Institucional'},source:{name:'Santander · bono blockchain',url:'https://www.santander.com/en/press-room/press-releases/2019/09/santander-launches-the-first-end-to-end-blockchain-bond',type:'Comunicado corporativo primario'},sources:[{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},{name:'Santander · bono blockchain',url:'https://www.santander.com/en/press-room/press-releases/2019/09/santander-launches-the-first-end-to-end-blockchain-bond',type:'Comunicado corporativo primario'}],fields:{'Puesto mundial':'13','Activos totales':'2.251,97 mil millones US$','Sede':'España','Actividad blockchain pública':'Emisión y liquidación de bonos tokenizados; participación en infraestructura mayorista','Custodia de criptoactivos':'No ofrecida como servicio minorista general en la fuente vinculada','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'bank-of-communications',name:'Bank of Communications',subtitle:'China · banca universal',status:'sourcechecked',bank:{rank:14,assets:2222.98,country:'China',region:'Asia-Pacífico',activity:'Infraestructura e-CNY',activityLevel:'Participación publicada',custody:'No verificada como servicio público',access:'Mercado doméstico'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'14','Activos totales':'2.222,98 mil millones US$','Sede':'China','Actividad blockchain pública':'Infraestructura bancaria vinculada al e-CNY','Custodia de criptoactivos':'No verificada como servicio público','Acceso':'Mercado doméstico','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'wells-fargo',name:'Wells Fargo',subtitle:'Estados Unidos · banca universal',status:'sourcechecked',bank:{rank:15,assets:2148.63,country:'Estados Unidos',region:'América',activity:'Sin producto vinculado',activityLevel:'Cobertura pendiente',custody:'No verificada como servicio público',access:'Sin alcance digital publicado'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'15','Activos totales':'2.148,63 mil millones US$','Sede':'Estados Unidos','Actividad blockchain pública':'Sin producto operativo enlazado a fuente primaria en este corte','Custodia de criptoactivos':'No verificada como servicio público','Acceso':'Sin alcance digital publicado','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'barclays',name:'Barclays',subtitle:'Reino Unido · banca universal e inversión',status:'sourcechecked',bank:{rank:16,assets:2078.28,country:'Reino Unido',region:'Europa',activity:'DLT y mercados institucionales',activityLevel:'Iniciativas publicadas',custody:'No verificada como servicio público general',access:'Institucional'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'16','Activos totales':'2.078,28 mil millones US$','Sede':'Reino Unido','Actividad blockchain pública':'Iniciativas DLT y de mercados institucionales; producto concreto pendiente de ficha primaria','Custodia de criptoactivos':'No verificada como servicio público general','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'smbc-group',name:'SMBC Group',subtitle:'Japón · banca universal',status:'sourcechecked',bank:{rank:17,assets:2020.13,country:'Japón',region:'Asia-Pacífico',activity:'Valores digitales',activityLevel:'Iniciativas publicadas',custody:'Alcance institucional',access:'Institucional'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'17','Activos totales':'2.020,13 mil millones US$','Sede':'Japón','Actividad blockchain pública':'Iniciativas de valores digitales y tokenización institucional','Custodia de criptoactivos':'Alcance institucional; verificar entidad y producto','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'groupe-bpce',name:'Groupe BPCE',subtitle:'Francia · banca universal',status:'sourcechecked',bank:{rank:18,assets:1986.83,country:'Francia',region:'Europa',activity:'Mercados digitales institucionales',activityLevel:'Iniciativas publicadas',custody:'Alcance sujeto a entidad',access:'Institucional'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'18','Activos totales':'1.986,83 mil millones US$','Sede':'Francia','Actividad blockchain pública':'Iniciativas de mercados y valores digitales dentro del grupo','Custodia de criptoactivos':'Alcance sujeto a entidad y servicio','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'mizuho',name:'Mizuho Financial Group',subtitle:'Japón · banca universal',status:'sourcechecked',bank:{rank:19,assets:1897.91,country:'Japón',region:'Asia-Pacífico',activity:'Valores tokenizados',activityLevel:'Iniciativas publicadas',custody:'Alcance institucional',access:'Institucional'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'19','Activos totales':'1.897,91 mil millones US$','Sede':'Japón','Actividad blockchain pública':'Iniciativas de valores tokenizados y liquidación digital','Custodia de criptoactivos':'Alcance institucional; verificar entidad y producto','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'china-merchants-bank',name:'China Merchants Bank',subtitle:'China · banca universal',status:'sourcechecked',bank:{rank:20,assets:1868.71,country:'China',region:'Asia-Pacífico',activity:'Infraestructura e-CNY',activityLevel:'Participación publicada',custody:'No verificada como servicio público',access:'Mercado doméstico'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'20','Activos totales':'1.868,71 mil millones US$','Sede':'China','Actividad blockchain pública':'Infraestructura bancaria vinculada al e-CNY','Custodia de criptoactivos':'No verificada como servicio público','Acceso':'Mercado doméstico','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'societe-generale',name:'Société Générale',subtitle:'Francia · banca universal e inversión',status:'sourcechecked',bank:{rank:21,assets:1813.02,country:'Francia',region:'Europa',activity:'SG-FORGE',activityLevel:'Infraestructura en producción',custody:'Servicios institucionales',access:'Institucional'},source:{name:'SG-FORGE',url:'https://www.sgforge.com/',type:'Plataforma corporativa primaria'},sources:[{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},{name:'SG-FORGE',url:'https://www.sgforge.com/',type:'Plataforma corporativa primaria'}],fields:{'Puesto mundial':'21','Activos totales':'1.813,02 mil millones US$','Sede':'Francia','Actividad blockchain pública':'SG-FORGE · emisión, estructuración y servicios sobre activos digitales','Custodia de criptoactivos':'Servicios institucionales según entidad y jurisdicción','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'goldman-sachs',name:'Goldman Sachs',subtitle:'Estados Unidos · banca de inversión',status:'sourcechecked',bank:{rank:22,assets:1809.32,country:'Estados Unidos',region:'América',activity:'Digital Assets Platform',activityLevel:'Infraestructura institucional',custody:'No publicada como oferta minorista',access:'Institucional'},source:{name:'Goldman Sachs · Digital Assets',url:'https://www.goldmansachs.com/what-we-do/FICC-and-equities/digital-assets',type:'Fuente corporativa primaria'},sources:[{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},{name:'Goldman Sachs · Digital Assets',url:'https://www.goldmansachs.com/what-we-do/FICC-and-equities/digital-assets',type:'Fuente corporativa primaria'}],fields:{'Puesto mundial':'22','Activos totales':'1.809,32 mil millones US$','Sede':'Estados Unidos','Actividad blockchain pública':'Plataforma institucional de activos digitales y tokenización','Custodia de criptoactivos':'No publicada como oferta minorista general','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'royal-bank-canada',name:'Royal Bank of Canada',subtitle:'Canadá · banca universal',status:'sourcechecked',bank:{rank:23,assets:1726.91,country:'Canadá',region:'América',activity:'Sin producto vinculado',activityLevel:'Cobertura pendiente',custody:'No verificada como servicio público',access:'Sin alcance digital publicado'},source:{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},fields:{'Puesto mundial':'23','Activos totales':'1.726,91 mil millones US$','Sede':'Canadá','Actividad blockchain pública':'Sin producto operativo enlazado a fuente primaria en este corte','Custodia de criptoactivos':'No verificada como servicio público','Acceso':'Sin alcance digital publicado','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'deutsche-bank',name:'Deutsche Bank',subtitle:'Alemania · banca universal e inversión',status:'sourcechecked',bank:{rank:24,assets:1684.94,country:'Alemania',region:'Europa',activity:'Custodia de activos digitales',activityLevel:'Desarrollo institucional',custody:'Arquitectura institucional publicada',access:'Institucional'},source:{name:'Deutsche Bank · activos digitales',url:'https://www.db.com/news/detail/20230620-deutsche-bank-applies-for-digital-assets-license',type:'Comunicado corporativo primario'},sources:[{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},{name:'Deutsche Bank · activos digitales',url:'https://www.db.com/news/detail/20230620-deutsche-bank-applies-for-digital-assets-license',type:'Comunicado corporativo primario'}],fields:{'Puesto mundial':'24','Activos totales':'1.684,94 mil millones US$','Sede':'Alemania','Actividad blockchain pública':'Desarrollo de custodia y tokenización para clientes institucionales','Custodia de criptoactivos':'Arquitectura institucional publicada; verificar autorización y disponibilidad','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}},
      {id:'ubs',name:'UBS Group',subtitle:'Suiza · banca universal y gestión patrimonial',status:'sourcechecked',bank:{rank:25,assets:1617.43,country:'Suiza',region:'Europa',activity:'UBS Tokenize',activityLevel:'Servicio institucional',custody:'Custodios regulados integrados',access:'Institucional'},source:{name:'UBS Tokenize',url:'https://www.ubs.com/global/en/investment-bank/tokenize.html',type:'Producto corporativo primario'},sources:[{name:'S&P Global Market Intelligence',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026',type:'Ranking mundial por activos'},{name:'UBS Tokenize',url:'https://www.ubs.com/global/en/investment-bank/tokenize.html',type:'Producto corporativo primario'}],fields:{'Puesto mundial':'25','Activos totales':'1.617,43 mil millones US$','Sede':'Suiza','Actividad blockchain pública':'UBS Tokenize · bonos, fondos y productos estructurados','Custodia de criptoactivos':'Custodios regulados integrados en el servicio','Acceso':'Institucional','Corte de activos':'31 dic 2025 · S&P Global 2026'}}
    ]},
    exchanges:{label:'Exchanges',description:'Plataformas contrastadas con registros regulatorios, tarifas públicas y metodología de coste total.',items:[
      {id:'coinbase',name:'Coinbase',subtitle:'Exchange centralizado',status:'verified',source:{name:'Coinbase · licencias europeas',url:'https://www.coinbase.com/en-de/legal/licenses/europe',type:'Divulgación regulatoria del proveedor'},fields:{'Cobertura':'Europa · verificar entidad contratante','Autorización':'Comprobar servicios y pasaporte en ESMA','Precio':'Coinbase REST/WebSocket entra en Kaufman Reference Price','Riesgo':'Custodia y contraparte centralizada'}},
      {id:'kraken',name:'Kraken',subtitle:'Exchange centralizado',status:'auto',source:{name:'Kraken AssetPairs API',url:'https://docs.kraken.com/api/docs/rest-api/get-tradable-asset-pairs',type:'API y documentación oficial'},fields:{'Mercado de referencia':'BTC/USD · ETH/USD','Comisiones':'Primer tramo maker/taker conectado diariamente','Precio':'Kraken entra en la mediana Kaufman','Riesgo':'Verificar entidad, licencia y servicios por país'}},
      {id:'bitstamp',name:'Bitstamp',subtitle:'Exchange centralizado',status:'verified',source:{name:'ESMA MiCA Register',url:'https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica',type:'Registro regulatorio europeo'},fields:{'Autorización UE':'Consultar entidad y servicios en registro MiCA','Precio':'No forma parte de Kaufman Reference Price v1','Comisiones':'Requiere tarifa aplicable al cliente y volumen','Riesgo':'Custodia y contraparte centralizada'}}
    ]},
    wallets:{label:'Wallets',description:'Autocustodia, custodia delegada y cuentas programables separadas por control de claves, exposición y recuperación.',items:[
      {id:'ngrave-zero',name:'NGRAVE ZERO',subtitle:'Signer hardware · air-gapped',status:'verified',source:{name:'NGRAVE ZERO',url:'https://ngrave.io/en/page/backup/zero/',type:'Especificaciones oficiales del producto'},wallet:{class:'Signer hardware',temperature:'Firma offline por QR',control:'Clave en dispositivo',signing:'Pantalla táctil y QR',recovery:'Perfect Key · GRAPHENE opcional'},fields:{'Modelo':'Autocustodia con signer hardware air-gapped','Aislamiento':'Sin USB, Bluetooth o Wi-Fi durante la firma; intercambio mediante QR','Certificación':'Sistema operativo con CC EAL7 según NGRAVE; el alcance no equivale a certificar toda la operativa','Recuperación':'Perfect Key o frase compatible; copia metálica GRAPHENE opcional','Control crítico':'Confirmar compatibilidad de activos y guardar las copias en ubicaciones separadas'}},
      {id:'ledger',name:'Ledger Wallet + signer',subtitle:'Signer hardware · autocustodia',status:'verified',source:{name:'Ledger Academy',url:'https://www.ledger.com/academy/crypto-hardware-wallet',type:'Documentación oficial del producto'},wallet:{class:'Signer hardware',temperature:'Fría solo por uso',control:'Clave en dispositivo',signing:'Pantalla del signer',recovery:'Copia de recuperación'},fields:{'Modelo':'Autocustodia con signer hardware','Clave':'Aislada del ordenador conectado','Frío o caliente':'Puede ser frío si no firma contratos; el dispositivo no convierte por sí solo una cuenta activa en fría','Control crítico':'Verificar en pantalla, firmware, copia y origen del dispositivo'}},
      {id:'trezor',name:'Trezor Suite + dispositivo',subtitle:'Signer hardware · autocustodia',status:'verified',source:{name:'Trezor Learn',url:'https://trezor.io/learn/basics/what-is-a-hardware-wallet',type:'Documentación oficial del producto'},wallet:{class:'Signer hardware',temperature:'Fría solo por uso',control:'Clave en dispositivo',signing:'Pantalla del signer',recovery:'Copia de wallet'},fields:{'Modelo':'Autocustodia con signer hardware','Clave':'Generada y almacenada fuera de internet','Frío o caliente':'El uso con dApps añade riesgo de firma aunque la clave permanezca aislada','Código':'Compromiso open source declarado por Trezor'}},
      {id:'metamask',name:'MetaMask',subtitle:'Wallet software · autocustodia',status:'verified',source:{name:'MetaMask Help Center',url:'https://support.metamask.io/start/metamask-is-a-self-custodial-wallet',type:'Documentación oficial del producto'},wallet:{class:'Wallet software',temperature:'Caliente',control:'Clave o SRP del usuario',signing:'Navegador o móvil',recovery:'SRP / método configurado'},fields:{'Modelo':'Autocustodia en software','Clave':'Gestionada en un dispositivo conectado','Recuperación':'MetaMask no puede recuperar una SRP perdida','Control crítico':'Permisos, simulación, phishing, red y contrato antes de firmar'}},
      {id:'safe',name:'Safe Smart Account',subtitle:'Cuenta inteligente · control por umbral',status:'verified',source:{name:'Safe Docs',url:'https://docs.safe.global/advanced/smart-account-concepts',type:'Documentación técnica primaria'},wallet:{class:'Cuenta inteligente',temperature:'Depende de firmantes',control:'Umbral de propietarios',signing:'Firmas y políticas',recovery:'Gobernanza configurada'},fields:{'Modelo':'Cuenta programable sobre contratos','Control':'Lista de propietarios y umbral mínimo','Extensiones':'Módulos y guards pueden ampliar o restringir acciones','Control crítico':'Auditar firmantes, umbral, módulos, guards y ruta de recuperación'}}
    ]},
    proyectos:{label:'Proyectos',description:'La arquitectura Web3 explicada por función, dependencia y grado de descentralización; no por la popularidad del token.',items:[
      {id:'ethereum',name:'Ethereum',subtitle:'Liquidación, ejecución y disponibilidad',status:'verified',source:{name:'ethereum.org',url:'https://ethereum.org/developers/docs/',type:'Documentación técnica comunitaria'},project:{layer:'Liquidación',function:'Estado y ejecución',dependency:'Clientes, validadores y red P2P'},fields:{'Función Web3':'Liquidación y ejecución programable','Consenso':'Proof of Stake','Escalado':'L2 y disponibilidad de datos','Comprobación':'Nodo, clientes, EIP y contratos desplegados'}},
      {id:'arbitrum',name:'Arbitrum One',subtitle:'Escalado L2 · optimistic rollup',status:'auto',source:{name:'L2BEAT',url:'https://l2beat.com/scaling/projects/arbitrum',type:'Ficha técnica y matriz de riesgos conectada'},project:{layer:'Escalado',function:'Ejecución L2',dependency:'Secuenciador, upgrades, DA y salida'},fields:{'Función Web3':'Escalado de ejecución','Datos conectados':'TVS, madurez, stack, DA y riesgos','Riesgos':'Upgrades, secuenciador, validación y salida','Traducción':'Kaufman conserva el campo original y explica su significado'}},
      {id:'chainlink',name:'Chainlink',subtitle:'Oráculos e interoperabilidad',status:'verified',source:{name:'Chainlink Documentation',url:'https://docs.chain.link/',type:'Documentación técnica primaria'},project:{layer:'Datos externos',function:'Oráculos y mensajería',dependency:'Redes de nodos, contratos y configuración'},fields:{'Función Web3':'Datos externos y comunicación entre redes','Productos':'Data Feeds · Automation · CCIP','Comprobación':'Contrato y red concretos, no solo la marca','Riesgo':'Dependencias, permisos y configuración de integración'}},
      {id:'ipfs',name:'IPFS',subtitle:'Contenido direccionado y red P2P',status:'verified',source:{name:'IPFS Docs',url:'https://docs.ipfs.tech/concepts/what-is-ipfs/',type:'Documentación del protocolo'},project:{layer:'Datos',function:'Direccionamiento y transferencia',dependency:'Nodos, disponibilidad y pinning'},fields:{'Función Web3':'Direccionar, enrutar y transferir contenido por CID','No es':'Proveedor de almacenamiento ni nube por sí mismo','Persistencia':'Exige que nodos conserven o fijen el contenido','Comprobación':'CID, proveedor, redundancia, cifrado y ruta de recuperación'}},
      {id:'filecoin',name:'Filecoin',subtitle:'Mercado de almacenamiento verificable',status:'verified',source:{name:'Filecoin Docs',url:'https://docs.filecoin.io/basics/what-is-filecoin',type:'Documentación del protocolo'},project:{layer:'Almacenamiento',function:'Conservación incentivada',dependency:'Proveedores, acuerdos, pruebas y recuperación'},fields:{'Función Web3':'Almacenamiento P2P con incentivos y pruebas criptográficas','Mercado':'Clientes contratan proveedores de almacenamiento','Comprobación':'Duración, réplicas, recuperación y pruebas','Riesgo':'Disponibilidad del proveedor y diseño de redundancia'}},
      {id:'the-graph',name:'The Graph',subtitle:'Indexación y consulta de datos onchain',status:'verified',source:{name:'The Graph Docs',url:'https://thegraph.com/docs/en/about/',type:'Documentación del protocolo'},project:{layer:'Indexación',function:'Datos consultables',dependency:'Indexadores, endpoints de red e IPFS'},fields:{'Función Web3':'Transformar eventos y estado onchain en datos consultables','Productos':'Subgraphs · Substreams · Amp','Dependencias':'Indexadores, nodos de red, IPFS y gateway','Comprobación':'Deployment, errores de indexación, bloque y procedencia'}},
      {id:'ens',name:'ENS',subtitle:'Identidad y resolución de nombres',status:'verified',source:{name:'ENS Docs',url:'https://docs.ens.domains/learn/resolution/',type:'Documentación del protocolo'},project:{layer:'Identidad',function:'Nombre ↔ dirección',dependency:'Registry, resolver y configuración'},fields:{'Función Web3':'Resolver nombres legibles a direcciones y registros','Validación':'La resolución inversa debe confirmarse con resolución directa','Componentes':'Registry · registrars · resolvers','Riesgo':'Configuración, normalización, expiración y resolver usado'} }
    ]},
    mineria:{label:'Minería',description:'Estado de la red Bitcoin, dificultad, concentración de pools y economía de operación con fuentes públicas.',items:[
      {id:'bitcoin-sha256',name:'Red Bitcoin · SHA-256',subtitle:'Hashrate y dificultad',status:'auto',source:{name:'mempool.space API',url:'https://mempool.space/docs/api/rest',type:'API pública de red'},fields:{'Hashrate':'Snapshot diario conectado','Dificultad':'Valor y ajuste estimado conectados','Bloques':'Altura y tiempo observables','Cadencia pública':'Diaria en GitHub Pages'}},
      {id:'pools-bitcoin',name:'Pools de Bitcoin',subtitle:'Concentración de producción',status:'auto',source:{name:'mempool.space Mining API',url:'https://mempool.space/docs/api/rest',type:'API pública de minería'},fields:{'Universo':'Bloques identificados por pool','Ventanas':'24 h a 3 años según endpoint','Uso':'Concentración y dependencia operativa','Límite':'Identificación de pool basada en heurísticas públicas'}},
      {id:'operacion-minera',name:'Economía S21 XP',subtitle:'Ingreso y electricidad de equilibrio',status:'auto',source:{name:'BITMAIN Support',url:'https://support.bitmain.com/hc/en-us/articles/35383015643673-S21-XP-Specifications',type:'Especificación oficial'},fields:{'Equipo':'Antminer S21 XP','Hashrate':'270 TH/s típico','Potencia':'3.645 W típica','Resultado':'Calculado con red y precio observados'}}
    ]},
    hardware:{label:'Hardware',description:'Especificaciones comparables del fabricante; precio y stock solo se publicarán cuando exista un feed autorizado.',items:[
      {id:'s21-xp',name:'Antminer S21 XP',subtitle:'SHA-256 · refrigeración por aire',status:'verified',source:{name:'BITMAIN Support',url:'https://support.bitmain.com/hc/en-us/articles/35383015643673-S21-XP-Specifications',type:'Especificación oficial'},fields:{'Hashrate típico':'270 TH/s','Potencia típica':'3.645 W','Eficiencia típica':'13,5 J/TH','Entorno':'−20 a 45 °C · 220–277 V'}},
      {id:'s21-xp-hyd',name:'Antminer S21 XP Hyd',subtitle:'SHA-256 · refrigeración hidráulica',status:'verified',source:{name:'BITMAIN Support',url:'https://support.bitmain.com/hc/en-us/articles/34523540504857-S21-XP-Hyd-Specification',type:'Especificación oficial'},fields:{'Hashrate típico':'473 TH/s','Potencia típica':'5.676 W','Eficiencia típica':'12,0 J/TH','Requisito':'380–415 V · circuito hidráulico'}},
      {id:'s21',name:'Antminer S21',subtitle:'SHA-256 · refrigeración por aire',status:'verified',source:{name:'BITMAIN Support',url:'https://support.bitmain.com/hc/en-us/articles/23794895251609-S21-Specification',type:'Especificación oficial'},fields:{'Hashrate típico':'200 TH/s','Potencia típica':'3.500 W','Eficiencia típica':'17,5 J/TH','Entorno':'0 a 45 °C · 220–277 V'}}
    ]}
  };
  const BANK_INTELLIGENCE=window.KAUFMAN_BANK_INTELLIGENCE||null;
  if(BANK_INTELLIGENCE?.banks?.length===25){
    const weeklyBanks=new Map(BANK_INTELLIGENCE.banks.map((bank)=>[bank.id,bank]));
    const assetNumber=new Intl.NumberFormat('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2});
    CATALOGS.bancos.items=CATALOGS.bancos.items.map((item)=>{
      const observed=weeklyBanks.get(item.id);
      if(!observed)return item;
      return {
        ...item,
        bank:{...item.bank,rank:observed.rank,assets:observed.assets_usd_billions},
        fields:{
          ...(item.fields||{}),
          'Puesto mundial':String(observed.rank),
          'Activos totales':`${assetNumber.format(observed.assets_usd_billions)} mil millones US$`,
          'Edición del ranking':`${BANK_INTELLIGENCE.ranking.edition} · S&P Global`,
          'Actualización del ranking':'Revisión automática semanal; solo se publica una tabla completa y validada'
        }
      };
    });
  }
  const HOME_DIRECTORY_KEYS = ['empresas','bancos','exchanges','wallets','proyectos','mineria','hardware'];
  const ECOSYSTEM_ORDER = ['mercado','regulacion','empresas','infraestructura','custodia'];
  const ECOSYSTEM_TERRITORIES = {
    mercado:{index:'01',label:'Mercado',x:21,y:22,side:'left',headline:'Precio, liquidez y capital tokenizado.',description:'Precios de referencia, productos tokenizados, exchanges y efectos fiscales de la operación seleccionada.',decision:'Tamaño de mercado, liquidez disponible y coste estimado de la operación.',action:'Consultar mercado y costes',href:'/mercados/',linkLabel:'Abrir datos de mercado',sublayers:[['Precios','/mercados/'],['RWA','/tokenizacion/'],['Exchanges','/exchanges/'],['Minería','/mineria/#economia-minera'],['Fiscalidad','/fiscal/']]},
    regulacion:{index:'02',label:'Regulación',x:10,y:63,side:'left',headline:'Normativa por jurisdicción y autoridad.',description:'Fuentes oficiales, autoridades competentes, actividades reguladas y fechas efectivas.',decision:'Autorizaciones y obligaciones aplicables a la operación seleccionada.',action:'Consultar regulación',href:'/regulacion/',linkLabel:'Abrir regulación',sublayers:[['Marcos vigentes','/regulacion/'],['Fiscalidad','/fiscal/'],['Bancos','/bancos/']]},
    empresas:{index:'03',label:'Empresas',x:54,y:13,side:'top',headline:'Empresas e iniciativas verificables.',description:'Compañías, bancos y productos tokenizados vinculados a fuentes corporativas o registros públicos.',decision:'Entidad responsable, actividad declarada y alcance documentado de cada iniciativa.',action:'Consultar entidades',href:'/empresas/',linkLabel:'Abrir empresas',sublayers:[['Empresas','/empresas/'],['Bancos','/bancos/'],['RWA','/tokenizacion/'],['Proyectos','/proyectos/']]},
    infraestructura:{index:'04',label:'Infraestructura',x:86,y:35,side:'right',headline:'Redes, minería, hardware y dependencias.',description:'Redes L2, proyectos, equipos mineros, costes técnicos y dependencias operativas.',decision:'Dependencias técnicas que afectan disponibilidad, coste y capacidad de retirada.',action:'Consultar infraestructura',href:'/mercados/',linkLabel:'Abrir infraestructura',sublayers:[['L2','/mercados/'],['Minería','/mineria/'],['Hardware','/hardware/'],['Proyectos','/proyectos/']]},
    custodia:{index:'05',label:'Custodia',x:70,y:82,side:'right',headline:'Control de claves, contraparte y recuperación.',description:'Wallets, exchanges y bancos comparados por control de claves, entidad responsable y recuperación.',decision:'Control de claves, procedimiento de recuperación y exposición a contraparte.',action:'Consultar custodia',href:'/wallets/',linkLabel:'Abrir custodia',sublayers:[['Wallets','/wallets/'],['Exchanges','/exchanges/'],['Bancos','/bancos/']]}
  };

  const STATUS_LABELS = {verified:'VERIFICADO',sourcechecked:'FUENTE CONTRASTADA',unverified:'REVISIÓN NECESARIA',auto:'AUTOMÁTICO',offline:'NO DISPONIBLE'};
  const REGULATION_LEVEL_LABELS = {BINDING:'VINCULANTE',OFFICIAL_RULEBOOK:'REGLAMENTO OFICIAL',OFFICIAL_GUIDANCE:'GUÍA OFICIAL',PRIMARY_LAW:'LEY PRIMARIA',OFFICIAL_ASSESSMENT:'EVALUACIÓN OFICIAL',CONSULTATION:'CONSULTA PÚBLICA · NO VIGENTE'};
  const MARKET_EDGE_ENDPOINT = '/api/market/snapshot';
  const MARKET_CONTEXT_ENDPOINT = '/api/market/context';
  const GAS_EDGE_ENDPOINT = '/api/market/gas';
  const MARKET_CONTINUITY_MAX_AGE_MS = 6 * 60 * 60 * 1000;
  const PRICE = new Intl.NumberFormat('es-ES',{style:'currency',currency:'USD',maximumFractionDigits:2,useGrouping:true});
  const SMALL_USD = new Intl.NumberFormat('es-ES',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:4});
  const APP_SCRIPT = document.querySelector('script[src*="kaufman-app.js"]');
  const APP_CACHE_VERSION = APP_SCRIPT ? new URL(APP_SCRIPT.src).searchParams.get('v') || 'dev' : 'dev';
  const REGULATION_SOURCE_CONTRACT = 'official-public-v2';
  const FILE_ROOT = location.protocol==='file:'&&APP_SCRIPT ? new URL('../',APP_SCRIPT.src) : null;
  const STATIC_HOST = /(^|\.)kaufmanadvisory\.io$|(^|\.)kaufmandvisory\.github\.io$/.test(location.hostname);
  let latestEthUsd = null;
  let latestMarketSnapshot = null;
  let marketEdgeTimer = null;
  let marketEdgeRequest = null;
  let marketContextTimer = null;
  let marketContextRequest = null;
  let gasEdgeTimer = null;
  let gasEdgeRequest = null;
  let regulationFallbackPromise = null;
  let platformFallbackPromise = null;
  let regulationDataset = null;
  let regulationRowsExpanded = false;
  let ecosystemPinned = 'infraestructura';

  function statusBadge(status){return `<span class="kf-status ${status}">${STATUS_LABELS[status]||status}</span>`}
  function brandMarkMarkup(){return `<svg class="kf-brand-mark" viewBox="0 0 64 44" aria-hidden="true" focusable="false"><path d="M13 7v30M13 22h17M30 22 50 7M30 22l20 15"/><path class="kf-brand-mark-route" d="M13 7 30 22 50 37"/><rect x="25" y="17" width="10" height="10" rx="2" transform="rotate(45 30 22)"/><circle cx="13" cy="7" r="2.5"/><circle cx="13" cy="37" r="2.5"/><circle cx="50" cy="7" r="2.5"/><circle cx="50" cy="37" r="2.5"/></svg>`}
  function escapeHtml(value){return String(value).replace(/[&<>'"]/g,(ch)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
  const PLAIN_LANGUAGE_REPLACEMENTS=[
    ['Antes de operar, sepa <span>qué puede cambiar la decisión.</span>','Datos actuales sobre <span>capital, mercados y blockchain.</span>'],
    ['Empieza por la decisión, no por el catálogo.','Directorios de entidades, proveedores e infraestructura.'],
    ['Explorar territorio','Abrir directorio'],
    ['Territorios de inteligencia','Directorios de datos'],
    ['Mapa Kaufman de Evidencia','Áreas de datos conectadas'],
    ['Qué puede cambiar una decisión.','Mercado, regulación, infraestructura, custodia y riesgo.'],
    ['Cada territorio responde una pregunta operativa. Selecciona uno para ver su implicación, las métricas conectadas y la siguiente comprobación.','Selecciona un área para consultar métricas, fuentes y comprobaciones relacionadas.'],
    ['Lo que ha cambiado y qué decisión puede afectar.','Cambios regulatorios y datos operativos recientes.'],
    ['¿Qué señal cambia la lectura del capital hoy?','Consultar flujos, precios y costes actuales'],
    ['Interrogar señales de mercado','Abrir datos de mercado'],
    ['Abrir radar regulatorio','Abrir regulación'],
    ['Abrir radar','Abrir regulación'],
    ['Briefing conectado','Actualizaciones verificadas'],
    ['Una lectura principal regulatoria y una columna operativa de minería. La fuente conserva fecha, alcance y método.','Actualizaciones de regulación, minería y hardware con fuente, fecha, alcance y método.'],
    ['La norma situada en su territorio.','Normativa por jurisdicción, autoridad y fecha.'],
    ['Actividad real detrás del anuncio.','Empresas e iniciativas con fuente verificable.'],
    ['La capa que sostiene el sistema.','Redes, minería, hardware y dependencias.'],
    ['Quién controla, conserva y recupera.','Control de claves, firma y recuperación.'],
    ['Dependencias visibles antes de decidir.','Riesgos técnicos, regulatorios y de custodia.'],
    ['Lo que cuesta Ethereum ahora.','Comisiones Ethereum EIP-1559 en tiempo real.'],
    ['Qué tarifa puede calcularse y cuál exige cuenta.','Comisiones maker y taker publicadas por exchange.'],
    ['Una aplicación descentralizada sigue teniendo dependencias.','Capas técnicas y dependencias de aplicaciones Web3.'],
    ['Medir el control real, no el relato.','Control y dependencia por componente técnico.'],
    ['Lo importante está debajo del ticker.','Madurez y dependencias de redes L2.'],
    ['Infraestructura L2 · explicada en español','Infraestructura L2 · datos y traducción'],
    ['RWA público en el radar','RWA público observado'],
    ['Muestra editorial declarada · no es un ranking','12 redes seleccionadas por cobertura técnica · no es un ranking'],
    ['Mercado que no aparece en un ticker','Capital tokenizado por clase y red'],
    ['El nuevo mapa del capital.','Mercado mundial de activos tokenizados.'],
    ['Dónde entra el capital.','Capital rastreado por clase.'],
    ['Por qué redes circula.','Capital rastreado por red.'],
    ['Concentración del mercado','Productos RWA por capital onchain'],
    ['Los productos que ya pesan.','Productos y protocolos con mayor capital onchain.'],
    ['No ordenamos monedas: ordenamos vehículos y protocolos por capital onchain rastreado, con clase de activo, redes y adaptador auditable.','Clasificación de productos y protocolos por capital onchain rastreado, clase de activo, redes y adaptador de datos.'],
    ['Rail de liquidación','Stablecoins USD por red'],
    ['Dónde vive el dólar tokenizado.','Valor circulante de stablecoins USD por red.'],
    ['USD, USDT y USDC no son sinónimos.','Tipos de conversión USD, USDT y USDC.'],
    ['CoinGecko, fuera del ticker.','Metadatos de CoinGecko.'],
    ['La antena de BTC y ETH queda como capa auxiliar.','Los precios de BTC y ETH se publican como contexto de mercado.'],
    ['El impuesto empieza antes de la cifra.','Reglas fiscales por jurisdicción y operación.'],
    ['Describe la operación. Kaufman calcula el impacto incremental.','Cálculo fiscal incremental por operación.'],
    ['Cambios que sí importan','Cambios fiscales con fuente oficial'],
    ['Radar fiscal 2026.','Cambios fiscales verificados en 2026.'],
    ['Realidad del dato','Cobertura de fuentes fiscales'],
    ['La cobertura también se audita.','Cobertura, disponibilidad y revisión de fuentes.'],
    ['Gira el mundo. Cambia el hecho.','Jurisdicciones fiscales disponibles.'],
    ['El periodo cambia la lectura.','Rendimiento histórico por periodo.'],
    ['Horizontes conectados','Periodos de rendimiento'],
    ['Rendimientos observados en mercados públicos para 7, 30 y 365 días.','Rendimientos observados en mercados públicos para 7, 30 y 90 días.'],
    ['<th class="number">1 año</th>','<th class="number">90 días</th>'],
    ['data-return-period="365d"','data-return-period="90d"'],
    ['Dos fichas, los mismos campos.','Comparación de fichas con campos equivalentes.'],
    ['De la evidencia a una decisión concreta.','Consulta operativa con fuentes y límites.'],
    ['Antes de mover capital, delimita la operación.','Comprobación previa de una operación de mercado.'],
    ['La norma importa cuando se aplica a una operación.','Consulta regulatoria por operación y jurisdicción.'],
    ['Una emisión necesita más que una red.','Comprobación técnica y jurídica de una emisión.'],
    ['Convierte el cálculo en una condición de decisión.','Entradas, resultados y límites del cálculo.'],
    ['La diferencia que cambia la decisión.','Resultado comparado por jurisdicción y operación.'],
    ['No envíes secretos ni fondos.','Información que no debe incluirse en el formulario.'],
    ['La infraestructura financiera que ya se está moviendo onchain: deuda pública, fondos, crédito, materias primas, acciones y redes de liquidación. El precio cripto es contexto, no el producto.','Datos de deuda pública, fondos, crédito, materias primas, acciones y redes de liquidación onchain. Los precios cripto se muestran como contexto.'],
    ['Inteligencia de activos tokenizados','Datos de activos tokenizados'],
    ['Inteligencia fiscal comparada','Datos fiscales comparados'],
    ['Selecciona un territorio para cambiar la ruta de comprobación.','Selecciona un área para consultar sus datos y fuentes.']
  ];
  function plainLanguage(html){return PLAIN_LANGUAGE_REPLACEMENTS.reduce((output,[before,after])=>output.replaceAll(before,after),html)}
  function internalUrl(path){
    if(!FILE_ROOT||!path.startsWith('/'))return path;
    const parsed=new URL(path,'https://kaufman.local');
    const filePages={'/aviso-legal.html':'aviso','/privacidad.html':'privacidad','/politica-cookies.html':'cookies','/terminos.html':'terminos','/checkout.html':'retirado','/intake.html':'retirado'};
    const routePage=filePages[parsed.pathname]||(parsed.pathname==='/'?'home':parsed.pathname.split('/').filter(Boolean)[0]||'home');
    const params=new URLSearchParams(parsed.search);
    if(routePage!=='home')params.set('pagina',routePage);
    const local=new URL('index.html',FILE_ROOT);local.search=params.toString();local.hash=parsed.hash;
    return local.href;
  }
  function assetUrl(path){
    if(!FILE_ROOT)return path;
    return new URL(path.replace(/^\/assets\//,''),APP_SCRIPT.src).href;
  }
  function dataAssetUrl(filename){
    const url=new URL(filename,APP_SCRIPT.src);
    url.searchParams.set('v',APP_CACHE_VERSION);
    url.searchParams.set('snapshot',String(Math.floor(Date.now()/3600000)));
    return url.href;
  }
  function pollingUrl(endpoint,windowMs=60000){
    const url=new URL(endpoint,location.href);
    url.searchParams.set('window',String(Math.floor(Date.now()/windowMs)));
    return url.href;
  }
  function localizeRenderedLinks(root=document){
    if(!FILE_ROOT)return;
    root.querySelectorAll('a[href^="/"]').forEach((link)=>link.setAttribute('href',internalUrl(link.getAttribute('href'))));
  }
  function profileUrl(type,id){return internalUrl(`/${encodeURIComponent(type)}/?id=${encodeURIComponent(id)}`)}
  function findRoute(key){return ROUTES.find((route)=>route.key===key)}

  function headerMarkup(page){
    const mainNav=[findRoute('mercados'),findRoute('regulacion'),findRoute('tokenizacion'),findRoute('mineria'),findRoute('fiscal')];
    return `
      <a class="kf-skip" href="#main-content">Saltar al contenido</a>
      <header class="kf-header">
        <div class="kf-container kf-header-row">
          <a class="kf-brand" href="/" aria-label="Kaufman, inicio">
            ${brandMarkMarkup()}
            <span class="kf-brand-copy"><span class="kf-brand-name">Kaufman</span><span class="kf-brand-tag">Blockchain intelligence</span></span>
          </a>
          <nav class="kf-nav" id="kf-nav" aria-label="Principal">
            ${mainNav.map((item)=>`<a href="${item.path}"${page===item.key?' aria-current="page"':''}>${item.label}</a>`).join('')}
          </nav>
          <div class="kf-header-actions">
            <button class="kf-icon-button kf-search-button" type="button" data-search-open><span>Buscar</span> ⌕</button>
            <button class="kf-icon-button kf-menu-button" type="button" aria-expanded="false" aria-controls="kf-nav">Menú</button>
          </div>
        </div>
      </header>`;
  }

  function footerMarkup(){
    return `<footer class="kf-footer"><div class="kf-container">
      <div class="kf-footer-grid">
        <div class="kf-footer-brand"><div class="kf-brand-name">Kaufman</div><p>Información sobre mercados, regulación y ecosistema blockchain conectada a fuentes públicas. Los campos sin integración se identifican de forma explícita.</p></div>
        <nav class="kf-footer-nav" aria-label="Mapa del sitio">${ROUTES.map((route)=>`<a href="${route.path}">${route.label}</a>`).join('')}<a href="/fuentes/">Fuentes</a></nav>
      <div class="kf-footer-meta"><span class="kf-footer-meta-title">Legal y contacto</span><a href="/aviso-legal.html">Aviso legal</a><a href="/privacidad.html">Política de privacidad</a><a href="/politica-cookies.html">Política de cookies</a><a href="/terminos.html">Términos de uso</a><button type="button" data-consent-manage>Gestionar analítica</button><a href="/contacto/">Contacto</a></div>
      </div>
      <div class="kf-footer-bottom"><span>© 2026 Kaufman Advisory Group LLC</span><span>Los datos pueden contener latencia. Verifica la fuente antes de decidir.</span></div>
    </div></footer>`;
  }

  function searchOverlayMarkup(){return `<div class="kf-search-overlay" data-search-overlay aria-hidden="true"><div class="kf-search-dialog" role="dialog" aria-modal="true" aria-label="Buscar en Kaufman"><div class="kf-search-head"><input class="kf-global-input" type="search" placeholder="Buscar país, exchange, wallet, proyecto…" aria-label="Buscar"><button class="kf-search-close" type="button" aria-label="Cerrar búsqueda">×</button></div><div class="kf-search-results" aria-live="polite"></div></div></div>`}

  function pageHero(title,description,kicker='Kaufman',state='auto'){
    const stateCopy={auto:'integraciones automáticas activas',verified:'revisión con fuente primaria',unverified:'interpretación que necesita revisión',offline:'fuente temporalmente no disponible'}[state]||'estado documentado';
    const normalized=title.toLowerCase();
    const signature=normalized.includes('mercado')?'market':normalized.includes('regulación')?'regulation':normalized.includes('tokenización')?'tokenization':normalized.includes('herramienta')?'tools':normalized.includes('fiscal')?'fiscal':'directory';
    const signal={market:['Comparar','Medir','Contextualizar'],regulation:['Territorio','Vigencia','Autoridad'],tokenization:['Activo','Vehículo','Red'],tools:['Entrada','Ejecución','Resultado'],fiscal:['Caso A','Contraste','Caso B'],directory:['Índice','Evidencia','Ficha']}[signature];
    const actions={
      market:{question:'¿Qué señal cambia la lectura del capital hoy?',label:'Interrogar señales de mercado',href:'/mercados/#senales-de-mercado'},
      regulation:{question:'¿Qué norma, fecha o autoridad condiciona la operación?',label:'Abrir radar regulatorio',href:'/regulacion/'},
      tokenization:{question:'¿Qué producto, red y concentración sostienen el activo?',label:'Explorar capital tokenizado',href:'/tokenizacion/'},
      fiscal:{question:'¿Cuándo nace el hecho imponible y qué dato falta?',label:'Calcular el impacto fiscal',href:'/fiscal/'},
      directory:{question:'¿Qué entidad o infraestructura necesitas comprobar?',label:'Consultar datos y fuentes',href:'#directorio'}
    };
    const noAction=['Aviso legal','Política de privacidad','Política de cookies','Términos de uso','Contacto','Ruta retirada'].includes(title)||kicker==='Error 404';
    const action=actions[signature];
    return `<section class="kf-page-hero kf-signature-${signature}"><div class="kf-container kf-page-hero-inner"><div class="kf-breadcrumbs"><a href="/">Inicio</a><span>/</span><span>${title}</span></div><div class="kf-page-heading"><div><p class="kf-kicker">${kicker}</p><h1 class="kf-page-title">${title}</h1></div><div class="kf-page-copy"><p>${description}</p><div class="kf-page-state ${state}"><i></i><span>${stateCopy}</span></div>${noAction?'':`<div class="kf-page-action"><strong>${action.question}</strong><a href="${action.href}">${action.label} →</a></div>`}</div><aside class="kf-page-signature" aria-hidden="true"><svg viewBox="0 0 300 120"><path d="M8 88 C58 88 65 24 118 40 S188 104 292 27"/><path d="M8 103 C75 55 144 112 292 73"/><circle cx="8" cy="88" r="4"/><circle cx="118" cy="40" r="5"/><circle cx="292" cy="27" r="4"/></svg><ol>${signal.map((item,index)=>`<li><span>0${index+1}</span>${item}</li>`).join('')}</ol></aside></div></div></section>`;
  }

  function homeHeroMarkup(){
    const operations=[
      ['operar','Operar o invertir con criptoactivos'],
      ['tokenizar','Tokenizar un activo o producto'],
      ['custodiar','Elegir custodia o proveedor'],
      ['infraestructura','Seleccionar red o infraestructura Web3'],
      ['mineria','Evaluar una operación minera']
    ];
    const jurisdictions=[['ES','España'],['UE','Unión Europea'],['US','Estados Unidos'],['GB','Reino Unido'],['AE','Emiratos Árabes Unidos'],['CH','Suiza'],['SG','Singapur'],['MX','México']];
    return `<section class="kf-engine-hero"><div class="kf-container"><div class="kf-engine-grid"><div class="kf-engine-copy"><p class="kf-eyebrow">Datos y consultas</p><h1>Datos actuales sobre <span>capital, mercados y blockchain.</span></h1><p>Consulta precios, regulación, fiscalidad, infraestructura, custodia y costes por tipo de operación y jurisdicción.</p><div class="kf-engine-actions"><a class="kf-button primary" href="#decision-brief">Configurar consulta <span>→</span></a><a class="kf-text-link" href="#explorar">Ver datos conectados</a></div><dl><div><dt>Datos</dt><dd>operación y jurisdicción</dd></div><div><dt>Controles</dt><dd>costes, regulación y custodia</dd></div><div><dt>Fuentes</dt><dd>evidencia pública</dd></div></dl></div><form class="kf-decision-builder" id="decision-brief" data-decision-builder><header><span>Consulta por operación</span><strong data-engine-state><i></i> Fuentes conectadas</strong></header><div class="kf-decision-fields"><label>Operación<select data-decision-operation>${operations.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label><label>Jurisdicción<select data-decision-jurisdiction>${jurisdictions.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label></div><div class="kf-decision-output" aria-live="polite"><span>COMPROBACIONES</span><h2 data-decision-title>Operar o invertir desde España</h2><p data-decision-summary>Comprueba tratamiento fiscal, proveedor, coste total, custodia y condiciones de salida antes de ejecutar.</p><ol data-decision-checks><li>Hecho fiscal y obligación de información</li><li>Autorización del proveedor</li><li>Coste total y custodia</li></ol><div class="kf-decision-live" data-market-asset="bitcoin"><span>Referencia BTC/USD</span><strong class="kf-market-price">—</strong></div></div><div class="kf-decision-actions"><a class="kf-button secondary" data-decision-public href="/fiscal/">Abrir información pública</a><a class="kf-button primary" data-decision-contact href="/contacto/?asunto=decision-brief&operacion=operar&jurisdiccion=ES">Solicitar análisis →</a></div><small>La información pública muestra datos generales. El análisis solicitado define la operación, las fuentes, los supuestos y los puntos pendientes.</small></form></div><div class="kf-engine-market">${marketBandMarkup(false)}</div></div></section>`;
  }

  function marketBandMarkup(showStatus=true){
    const assets=[['bitcoin','BTC','Bitcoin'],['ethereum','ETH','Ethereum']];
    return `<div class="kf-market-band"><div class="kf-container"><div class="kf-market-meta"><strong>Kaufman Reference Price</strong>${showStatus?'<span data-market-status aria-live="polite">Comprobando precios…</span>':''}</div><div class="kf-market-grid">${assets.map(([id,symbol,name])=>`<div class="kf-market-cell" data-market-asset="${id}"><img class="kf-coin-logo" src="${assetUrl(`/assets/logos/${id}.svg`)}" alt="Logo de ${name}"><div><div class="kf-market-name">${symbol}</div><div class="kf-market-pair">${name} / USD</div></div><div class="kf-market-value"><div class="kf-market-price">—</div></div></div>`).join('')}</div><div class="kf-market-source-note"><span data-market-source-summary>Precio de referencia contrastado</span><a href="/fuentes/">Ver fuentes y metodología →</a></div></div></div>`;
  }

  function priceMethodologyMarkup(){
    const rows=[['bitcoin','BTC','Bitcoin'],['ethereum','ETH','Ethereum']];
    return `<section class="kf-section kf-price-methodology"><div class="kf-container"><div class="kf-section-head"><div><p class="kf-kicker">Metodología de mercado</p><h2 class="kf-title small">Cálculo del precio de referencia.</h2></div><p class="kf-intro">Fuentes elegibles, cadencia, conversión de stablecoins y controles aplicados antes de publicar un precio.</p></div><div class="kf-antenna-contract"><div><span>Publicación</span><strong>Cálculo automático · objetivo 5 min</strong></div><div><span>Agregación</span><strong>Mediana de mercados elegibles</strong></div><div><span>Stablecoins</span><strong>USDT y USDC convertidos, sin paridad asumida</strong></div><div><span>Entrega</span><strong>Backend Kaufman · navegador sin APIs externas</strong></div></div><div class="kf-data-table-wrap"><table class="kf-data-table kf-reference-table"><thead><tr><th>Activo</th><th class="number">Precio USD</th><th>Actualización</th><th>Fuentes utilizadas</th><th>Confianza</th><th class="number">Divergencia máx.</th></tr></thead><tbody>${rows.map(([id,symbol,name])=>`<tr data-market-asset="${id}"><td><strong>${symbol}</strong> · ${name}</td><td class="number kf-market-price">—</td><td class="kf-market-change na" data-market-age>No disponible</td><td data-market-venues>Sin fuentes frescas</td><td data-market-confidence>—</td><td class="number" data-market-divergence>—</td></tr>`).join('')}</tbody></table></div><div class="kf-method-strip"><strong>Kaufman Reference Price v1</strong><span data-market-methodology>Mediana server-side · objetivo 5 min · volumen mínimo · divergencia máxima 2,5 % · hora visible.</span></div></div></section>`;
  }

  function providerHealthMarkup(){
    const groups=[
      ['price','Precio de referencia','Fuentes que intervienen en el cálculo de BTC y ETH.'],
      ['context','Datos complementarios','Identidad de activos y actividad en mercados descentralizados.'],
      ['infrastructure','Tokenización e infraestructura','Capital RWA, redes L2 y observaciones de Ethereum.']
    ];
    return `<section class="kf-section kf-source-health" data-provider-groups><div class="kf-container"><div class="kf-section-head"><div><p class="kf-kicker">Estado de las conexiones</p><h2 class="kf-title small">Qué aporta cada fuente.</h2></div><p class="kf-intro">Una conexión solo figura como activa si entrega registros. La disponibilidad técnica no certifica por sí sola la calidad del dato.</p></div><div class="kf-provider-status-groups">${groups.map(([id,title,description])=>`<section class="kf-provider-status-group"><header><span>${title}</span><p>${description}</p></header><div data-provider-group="${id}"><div class="kf-live-empty">Comprobando fuentes…</div></div></section>`).join('')}</div></div></section>`;
  }

  function directoryHubMarkup(){
    const totalProfiles=HOME_DIRECTORY_KEYS.reduce((total,key)=>total+(CATALOGS[key]?.items.length||0),0);
    const priorityKeys=['proyectos','wallets','bancos'];
    const priority=priorityKeys.map((key,index)=>{
      const catalog=CATALOGS[key],route=findRoute(key);
      const profiles=catalog.items.slice(0,3).map((item)=>`<a href="${profileUrl(key,item.id)}">${escapeHtml(item.name)} <span>↗</span></a>`).join('');
      return `<article class="kf-directory-territory kf-directory-territory-${index+1}" data-directory-card="${escapeHtml(key)}"><div class="kf-directory-coordinate"><span>0${index+1}</span><i></i><small>${escapeHtml(route.code)}</small></div><div><p>${catalog.items.length} registros conectados</p><h3><a href="${route.path}">${escapeHtml(catalog.label)}</a></h3><p class="kf-directory-summary">${escapeHtml(catalog.description)}</p><nav aria-label="Accesos rápidos de ${escapeHtml(catalog.label)}">${profiles}</nav><a class="kf-directory-route" href="${route.path}">Abrir directorio <span>→</span></a></div></article>`;
    }).join('');
    const indexRows=HOME_DIRECTORY_KEYS.filter((key)=>!priorityKeys.includes(key)).map((key,index)=>{
      const catalog=CATALOGS[key],route=findRoute(key);
      return `<a class="kf-directory-index-row" href="${route.path}"><span>${String(index+4).padStart(2,'0')}</span><strong>${escapeHtml(catalog.label)}</strong><small>${escapeHtml(catalog.description)}</small><b>${catalog.items.length} registros</b><i>→</i></a>`;
    }).join('');
    return `<section class="kf-section kf-home-directories" id="directorios" data-home-directories><div class="kf-container"><header class="kf-directory-head"><div><p class="kf-kicker">Directorios de datos</p><h2>Entidades, proveedores e infraestructura.</h2></div><div><strong>${HOME_DIRECTORY_KEYS.length}</strong><span>directorios · ${totalProfiles} registros conectados</span><p>Los tres directorios principales se muestran primero. Los demás aparecen en el índice inferior.</p></div></header><div class="kf-directory-priority">${priority}</div><div class="kf-directory-index"><div class="kf-directory-index-head"><span>Índice de secciones</span></div>${indexRows}</div></div></section>`;
  }

  function ecosystemMetrics(territoryId,snapshot){
    const referencePrices=Object.values(snapshot?.reference_prices||{});
    const tokenization=snapshot?.tokenization_markets||{};
    const l2=snapshot?.l2_intelligence||{};
    const fiscal=snapshot?.fiscal_intelligence||{};
    const regulation=snapshot?.regulation_intelligence||{};
    const connectedProviders=Object.values(snapshot?.providers||{}).filter((provider)=>['LIVE','CONNECTED','SNAPSHOT'].includes(provider?.connection_status)).length;
    const metric=(value,label,source)=>({value:value??'—',label,source});
    const countItems=(keys)=>keys.reduce((total,key)=>total+(CATALOGS[key]?.items.length||0),0);
    if(territoryId==='mercado')return [
      metric(referencePrices.filter((item)=>item?.verification_status==='VERIFIED').length||'—','precios de referencia publicados','Coinbase · Kraken · Binance'),
      metric(tokenization?.coverage?.rwa_protocols??'—','protocolos RWA rastreados','DefiLlama Open API'),
      metric(tokenizedUsd(tokenization?.kpis?.tracked_rwa_tvl_usd),'capital RWA onchain','Snapshot público conectado')
    ];
    if(territoryId==='regulacion')return [
      metric(regulation?.data_quality?.regime_count??'—','regímenes documentados','Fuentes públicas oficiales'),
      metric(regulation?.data_quality?.source_count??'—','fuentes regulatorias','Comprobación server-side'),
      metric(regulation?.events?.length??'—','cambios y fechas operativas','Registro jurídico Kaufman')
    ];
    if(territoryId==='empresas')return [
      metric(countItems(['empresas','bancos']),'entidades con ficha navegable','Fuentes corporativas y registros'),
      metric(tokenization?.leaders?.length??'—','productos RWA líderes observados','DefiLlama Open API'),
      metric(tokenization?.coverage?.networks??'—','redes con capital tokenizado','Distribución chainTvls')
    ];
    if(territoryId==='infraestructura')return [
      metric(l2?.coverage?.curated_projects??'—','proyectos L2 explicados','L2BEAT · muestra editorial'),
      metric(l2?.coverage?.projects??'—','proyectos L2 observados','L2BEAT API pública'),
      metric(Number.isFinite(Number(snapshot?.auxiliary?.ethereum_gas?.gas_gwei))?`${Number(snapshot.auxiliary.ethereum_gas.gas_gwei).toLocaleString('es-ES',{maximumFractionDigits:3})} Gwei`:'—','gas Ethereum observado','eth_feeHistory')
    ];
    if(territoryId==='custodia')return [
      metric(countItems(['wallets','exchanges','bancos']),'proveedores y herramientas comparables','Fichas Kaufman con fuente'),
      metric(connectedProviders||'—','fuentes de datos activas','Observación server-side'),
      metric(new Set(referencePrices.flatMap((item)=>item?.venues||[])).size||'—','mercados usados en referencias','Venues elegibles')
    ];
    return [];
  }

  function ecosystemPanelMarkup(territoryId,snapshot=latestMarketSnapshot){
    const territory=ECOSYSTEM_TERRITORIES[territoryId]||ECOSYSTEM_TERRITORIES.infraestructura;
    const metrics=ecosystemMetrics(territoryId,snapshot).map((item)=>`<div class="kf-eco-metric"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.source)}</small></div>`).join('');
    const sublayers=territory.sublayers.map(([label,href],index)=>`<a href="${href}"><span>${String(index+1).padStart(2,'0')}</span><strong>${escapeHtml(label)}</strong><i aria-hidden="true">→</i></a>`).join('');
    const briefHref=`/contacto/?asunto=decision-brief&territorio=${encodeURIComponent(territoryId)}`;
    return `<div class="kf-eco-panel-head"><p>${escapeHtml(territory.index)} / ${escapeHtml(territory.label)}</p></div><h3>${escapeHtml(territory.headline)}</h3><p class="kf-eco-panel-copy">${escapeHtml(territory.description)}</p><div class="kf-eco-decision"><span>DATOS APLICABLES</span><strong>${escapeHtml(territory.decision)}</strong></div><div class="kf-eco-metrics">${metrics}</div><div class="kf-eco-layers"><span>Áreas relacionadas</span><nav aria-label="Áreas de ${escapeHtml(territory.label)}">${sublayers}</nav></div><div class="kf-eco-panel-actions"><a class="kf-eco-open" href="${territory.href}">${escapeHtml(territory.linkLabel)} <span>→</span></a><a class="kf-eco-brief" href="${briefHref}">${escapeHtml(territory.action)}</a></div>`;
  }

  function ecosystemMapMarkup(){
    const nodes=ECOSYSTEM_ORDER.map((id)=>{const territory=ECOSYSTEM_TERRITORIES[id];const active=id==='infraestructura';return `<button class="kf-eco-node${active?' active':''}" id="ecosystem-tab-${id}" type="button" role="tab" aria-selected="${active}" aria-controls="kaufman-ecosystem-panel" data-eco-territory="${id}" data-side="${territory.side}" style="--eco-x:${territory.x}%;--eco-y:${territory.y}%"><span class="kf-eco-node-ring"><i></i></span><strong>${escapeHtml(territory.label)}</strong><small>${territory.index}</small></button>`}).join('');
    return `<section class="kf-section kf-ecosystem" id="explorar" data-ecosystem><div class="kf-container"><header class="kf-ecosystem-head"><div><p class="kf-kicker">Datos conectados</p><h2>Mercado, regulación, empresas, infraestructura y custodia.</h2></div><p>Selecciona un área para consultar métricas, fuentes y datos relacionados.</p></header><div class="kf-eco-shell"><div class="kf-eco-canvas" data-eco-current="infraestructura"><svg class="kf-eco-geometry" viewBox="0 0 960 600" aria-hidden="true"><path class="kf-eco-scaffold" d="M49 484 C77 211 272 44 548 62 C769 76 892 231 870 408 C850 541 711 581 576 520 C435 457 415 300 514 210 C592 139 713 167 747 253"/><path class="kf-eco-scaffold secondary" d="M94 518 C235 573 350 536 405 430 C457 331 425 208 335 150"/><path class="kf-eco-core-orbit" d="M331 318 C331 252 385 199 451 199 C517 199 570 252 570 318 C570 384 517 437 451 437 C385 437 331 384 331 318Z"/><path class="kf-eco-link" data-eco-link="mercado" d="M451 318 C369 273 285 197 197 131"/><path class="kf-eco-link" data-eco-link="regulacion" d="M451 318 C324 329 213 357 89 385"/><path class="kf-eco-link" data-eco-link="empresas" d="M451 318 C448 226 478 132 528 75"/><path class="kf-eco-link" data-eco-link="infraestructura" d="M451 318 C579 264 699 223 827 207"/><path class="kf-eco-link" data-eco-link="custodia" d="M451 318 C553 379 623 451 682 503"/><path class="kf-eco-link" data-eco-link="riesgo" d="M451 318 C397 416 342 485 283 539"/><path class="kf-eco-cross" d="M197 131 C334 88 456 84 528 75"/><path class="kf-eco-cross" d="M89 385 C243 393 338 421 283 539"/><path class="kf-eco-cross" d="M827 207 C776 332 745 425 682 503"/></svg><div class="kf-eco-center"><span>Datos</span><strong>K</strong><i></i></div><div class="kf-eco-node-list" role="tablist" aria-label="Áreas de datos Kaufman">${nodes}</div><div class="kf-eco-signals" aria-live="polite"><span data-eco-signal="market">Precios · comprobando</span><span data-eco-signal="regulation">Regulación · comprobando</span><span data-eco-signal="fiscal">Fiscal · comprobando</span></div></div><aside class="kf-eco-panel" id="kaufman-ecosystem-panel" role="tabpanel" aria-labelledby="ecosystem-tab-infraestructura" aria-live="polite" data-eco-panel>${ecosystemPanelMarkup('infraestructura',null)}</aside></div><p class="kf-eco-instruction"><span aria-hidden="true">↳</span> Selecciona un área para consultar sus datos y fuentes.</p></div></section>`;
  }

  function renderHome(){
    return `<main class="kf-main" id="main-content">
      ${homeHeroMarkup()}
      ${ecosystemMapMarkup()}
      <section class="kf-section kf-intelligence-briefing"><div class="kf-container"><header><div><p class="kf-kicker">Datos verificados</p><h2>Regulación, minería y hardware.</h2></div><p>Fuentes oficiales y cálculos públicos con alcance y método identificados.</p></header><div class="kf-briefing-grid"><section class="kf-briefing-lead"><div class="kf-briefing-label"><span>Regulación mundial</span><a href="/regulacion/">Abrir regulación →</a></div><div data-home-regulation><div class="kf-live-empty">Cargando regulación…</div></div></section><aside class="kf-briefing-rail"><section><div class="kf-briefing-label"><span>Minería y hardware</span><span><a href="/mineria/">Minería →</a> <a href="/hardware/">Hardware →</a></span></div><div data-home-mining><div class="kf-live-empty">Cargando datos mineros…</div></div></section><div class="kf-briefing-metrics" data-home-mining-metrics><div class="kf-live-empty">Cargando cálculo minero…</div></div></aside></div></div></section>
      ${directoryHubMarkup()}
    </main>`;
  }

  function decisionCloseMarkup(page){
    if(page==='mineria'||page==='home')return '';
    const context={
      mercados:['Antes de mover capital, delimita la operación.','Conecta estructura de mercado, vehículo tokenizado, liquidez, costes y jurisdicción en una sola lectura.'],
      tokenizacion:['Una emisión necesita más que una red.','Ordena activo, vehículo, jurisdicción, infraestructura, custodia y riesgos antes de elegir arquitectura.'],
      fiscal:['Comprobación fiscal de los datos introducidos.','Lista de hechos, fuentes, supuestos y puntos para revisión profesional.']
    }[page]||['Convierte esta ficha en una decisión comprobable.','Incluye la entidad, el territorio y el objetivo; Kaufman conecta las evidencias relevantes y señala los huecos.'];
    return `<section class="kf-decision-close" aria-labelledby="decision-close-title"><div class="kf-container"><div><p class="kf-kicker">Kaufman Decision Brief</p><h2 id="decision-close-title">${context[0]}</h2><p>${context[1]}</p></div><ol><li><span>01</span>Operación y jurisdicción</li><li><span>02</span>Mercado, coste e infraestructura</li><li><span>03</span>Regulación, custodia y riesgo</li></ol><div class="kf-decision-close-action"><strong>Contenido definido antes de empezar</strong><span>Alcance, formato, plazo y presupuesto se confirman por escrito.</span><a class="kf-button primary" href="/contacto/?asunto=decision-brief&origen=${encodeURIComponent(page)}">Solicitar Decision Brief →</a></div></div></section>`;
  }

  function dataNoteMarkup(hasVerified=false){
    return `<div class="kf-data-note"><span>${statusBadge(hasVerified?'verified':'auto')}</span><div><strong>${hasVerified?'Registros respaldados por fuentes':'Registros monitorizados automáticamente'}</strong><p>Consulta cada ficha para abrir la evidencia, revisar su alcance y entender qué no permite concluir.</p></div><a href="/fuentes/">Fuentes →</a></div>`;
  }

  function marketSignalsMarkup(){
    return `<section class="kf-section kf-market-signals" id="senales-de-mercado" data-market-context><div class="kf-container"><div class="kf-section-head"><div><p class="kf-kicker">Datos institucionales y derivados</p><h2 class="kf-title small">Flujos ETF, capitalización, interés abierto y volatilidad.</h2></div><p class="kf-intro">Datos de mercado con fuente, fecha, cobertura y metodología separadas. No se suman magnitudes con definiciones distintas.</p></div><div class="kf-market-signal-layout"><article class="kf-etf-signal"><header><div><span>ETF spot de EE. UU.</span><h3>Flujo neto diario</h3></div><small data-etf-status>Conectando fuentes públicas…</small></header><div class="kf-period-selector" role="group" aria-label="Periodo del flujo ETF"><button type="button" class="active" data-etf-range="7" aria-pressed="true">7 días</button><button type="button" data-etf-range="30" aria-pressed="false">30 días</button><button type="button" data-etf-range="90" aria-pressed="false">90 días</button></div><div class="kf-etf-latest"><div><span data-etf-latest-label="bitcoin">Bitcoin · últimos 7 días</span><strong data-etf-latest="bitcoin">—</strong><small data-etf-date="bitcoin">Sesiones pendientes</small></div><div><span data-etf-latest-label="ethereum">Ethereum · últimos 7 días</span><strong data-etf-latest="ethereum">—</strong><small data-etf-date="ethereum">Sesiones pendientes</small></div></div><div class="kf-etf-legend"><span><i class="btc"></i>Bitcoin</span><span><i class="eth"></i>Ethereum</span><small>USD · barras sobre/bajo cero</small></div><div class="kf-etf-chart" data-etf-chart data-range="7"><div class="kf-live-empty">Esperando sesiones publicadas…</div></div><footer><span data-etf-period>Últimos 7 días</span><nav><a href="https://bykaranteli.com/data" target="_blank" rel="noopener noreferrer">Histórico ↗</a><a href="https://coinflows.org/" target="_blank" rel="noopener noreferrer">Contraste ↗</a><a href="https://www.ishares.com/us/products/333011/ishares-bitcoin-trust-etf" target="_blank" rel="noopener noreferrer">Emisor ↗</a></nav></footer></article><aside class="kf-market-structure"><article class="kf-dominance-signal"><header><span>Dominancia por capitalización</span><small data-dominance-time>CoinGecko Global</small></header><div class="kf-dominance-values"><div><i class="btc"></i><span>Bitcoin</span><strong data-dominance="btc">—</strong></div><div><i class="eth"></i><span>Ethereum</span><strong data-dominance="eth">—</strong></div><div><i class="other"></i><span>Resto</span><strong data-dominance="others">—</strong></div></div><div class="kf-dominance-bar"><i data-dominance-bar="btc"></i><i data-dominance-bar="eth"></i><i data-dominance-bar="others"></i></div></article><article class="kf-oi-signal"><header><span>Interés abierto monitorizado</span><a href="https://defillama.com/open-interest" target="_blank" rel="noopener noreferrer">DefiLlama ↗</a></header><strong data-open-interest>—</strong><div><span data-open-interest-change>Variación 7 d —</span><small data-open-interest-time>Perímetro de adaptadores de la fuente</small></div><ol data-open-interest-venues></ol></article><article class="kf-vol-signal"><header><span>Volatilidad implícita · DVOL</span><a href="https://docs.deribit.com/api-reference/market-data/public-get_volatility_index_data" target="_blank" rel="noopener noreferrer">Deribit ↗</a></header><div><span>Bitcoin<strong data-dvol="btc">—</strong></span><span>Ethereum<strong data-dvol="eth">—</strong></span></div><small data-dvol-time>Último cierre horario disponible</small></article></aside></div>${gasPanelMarkup()}</div></section>`;
  }

  function gasPanelMarkup(){
    const tiers=[['safe','Lento','Percentil 10'],['standard','Estándar','Percentil 50'],['fast','Rápido','Percentil 90']];
    return `<section class="kf-live-panel kf-fee-panel"><div class="kf-live-panel-head"><div><p class="kf-kicker">Comisiones EIP-1559 observadas</p><h2>Lo que cuesta Ethereum ahora.</h2></div><div class="kf-live-actions"><span data-gas-status aria-live="polite">Esperando bloque de Ethereum…</span></div></div><div class="kf-fee-context"><div><span>Base fee siguiente bloque</span><strong data-gas-base>—</strong><small>Gwei</small></div><div><span>Uso de gas mediano</span><strong data-gas-utilization>—</strong><small>20 bloques observados</small></div><div><span>Bloque</span><strong data-gas-block>—</strong><small data-gas-block-time>Timestamp pendiente</small></div></div><div class="kf-fee-tiers">${tiers.map(([key,label,note])=>`<article data-gas-tier="${key}"><span>${label}</span><strong data-gas-tier-gwei>—</strong><small>Gwei · ${note}</small><div><b data-gas-tier-cost>—</b><em>transferencia ETH · 21.000 gas</em></div></article>`).join('')}</div><div class="kf-fee-sources"><div><span>Fuente canónica</span><a href="https://ethereum.org/es/developers/docs/apis/json-rpc/#eth_feehistory" target="_blank" rel="noopener noreferrer">Ethereum eth_feeHistory ↗</a><small>Base fee + propinas observadas · actualización server-side con objetivo de cinco minutos</small></div><div><span>Consulta pública</span><a href="https://etherscan.io/gastracker" target="_blank" rel="noopener noreferrer">Etherscan Gas Tracker ↗</a><small>Referencia visual externa; no interviene en el cálculo Kaufman</small></div></div></section>`;
  }

  function exchangeFeesMarkup(){
    return `<section class="kf-live-panel"><div class="kf-live-panel-head"><div><p class="kf-kicker">Comisiones conectadas</p><h2>Qué tarifa puede calcularse y cuál exige cuenta.</h2></div><div class="kf-live-actions"><span data-exchange-fee-status aria-live="polite">Cargando fuentes oficiales…</span></div></div><div class="kf-data-table-wrap"><table class="kf-data-table"><thead><tr><th>Exchange</th><th>Mercado y condición</th><th class="number">Maker</th><th class="number">Taker</th><th>Fuente</th></tr></thead><tbody data-exchange-fee-rows><tr><td colspan="5">Conectando tarifas oficiales…</td></tr></tbody></table></div><p class="kf-live-footnote">Actualización diaria. La tabla separa tarifa exacta pública de tarifa condicionada a cuenta, volumen, región o programa. No incluye spread, conversión, retirada ni deslizamiento.</p></section>`;
  }

  function renderRegulationV2(){
    const activities=[['all','Todas las actividades'],['issuer','Emisión'],['stablecoin','Stablecoins'],['custody','Custodia'],['exchange','Exchange'],['brokerage','Órdenes e intermediación'],['transfer','Transferencias'],['marketing','Promoción'],['payments','Pagos']];
    return `<main class="kf-main kf-regulation-page" id="main-content" data-regulation-dashboard>
      <header class="kf-reg-hero"><div class="kf-container"><div class="kf-breadcrumbs"><a href="/">Inicio</a><span>/</span><span>Regulación</span></div><div class="kf-reg-hero-grid"><div><p class="kf-kicker">Jurisdicciones · fuentes oficiales</p><h1>Regulación</h1><p class="kf-reg-hero-deck">Compara qué actividad necesita autorización, a quién afecta y qué queda fuera en cada país o territorio.</p><span class="kf-reg-live" data-regulation-status aria-live="polite">Conectando fuentes oficiales…</span></div><div class="kf-reg-flow" aria-label="Actividades que pueden activar obligaciones regulatorias"><p>La actividad determina el perímetro</p><div><span><i>01</i><strong>Emitir</strong></span><span><i>02</i><strong>Custodiar</strong></span><span><i>03</i><strong>Intercambiar</strong></span><span><i>04</i><strong>Promocionar</strong></span></div><small>Una misma operación puede activar más de una licencia.</small></div></div><div class="kf-reg-facts"><div><span>Marcos comparados</span><strong data-reg-kpi="regime_count">—</strong></div><div><span>Países y territorios</span><strong data-reg-kpi="jurisdiction_count">—</strong></div><div><span>Fuentes oficiales accesibles</span><strong data-reg-reachable>—</strong></div><div><span>Revisión jurídica firmada</span><strong data-reg-signed>—</strong></div></div></div></header>
      <section class="kf-section kf-reg-registry" id="comparar-regulacion"><div class="kf-container"><div class="kf-reg-section-head"><div><p class="kf-kicker">Matriz regulatoria</p><h2>Qué exige cada marco y a quién.</h2></div><p>Lee primero el acceso al mercado. Abre una fila para revisar obligaciones, exclusiones y controles concretos del proveedor.</p></div><div class="kf-reg-tools"><label><span>Buscar país, marco o autoridad</span><input type="search" data-regulation-search placeholder="Ej. Israel, custodia, SEC"></label><label><span>Actividad</span><select data-regulation-activity>${activities.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label><strong data-regulation-count>—</strong></div><div class="kf-reg-table" data-regulation-table><div class="kf-reg-table-head"><span>País / marco</span><span>A quién afecta</span><span>Acceso al mercado</span><span>Actividades cubiertas</span><span>Detalle</span></div><div data-regulation-regimes><div class="kf-live-empty">Cargando marcos regulatorios…</div></div></div><button class="kf-list-expand" type="button" data-regulation-expand aria-expanded="false">Ver todas las jurisdicciones</button></div></section>
      <section class="kf-section kf-reg-compare" id="comparador-regulatorio"><div class="kf-container"><div class="kf-reg-section-head"><div><p class="kf-kicker">Comparación directa</p><h2>Dos marcos, la misma operación.</h2></div><p>No asigna una puntuación ni declara un país “mejor”. Expone diferencias de autorización, alcance, obligaciones y exclusiones.</p></div><div class="kf-reg-compare-controls"><label>Primer marco<select data-regulation-compare="left"></select></label><label>Segundo marco<select data-regulation-compare="right"></select></label></div><div class="kf-reg-compare-grid" data-regulation-comparison><div class="kf-live-empty">Cargando comparación…</div></div></div></section>
      <section class="kf-section kf-reg-calendar" id="fechas-regulatorias"><div class="kf-container"><div class="kf-reg-section-head"><div><p class="kf-kicker">Fechas operativas</p><h2>Qué cambió y desde cuándo.</h2></div><p>Solo se muestran fechas que modifican una autorización, transición o texto aplicable.</p></div><div class="kf-reg-events" data-regulation-events><div class="kf-live-empty">Cargando fechas verificadas…</div></div></div></section>
      <section class="kf-section kf-reg-evidence" id="fuentes-regulatorias"><div class="kf-container"><details><summary><span>Fuentes y estado de revisión</span><strong data-reg-source-summary>Comprobando…</strong></summary><div class="kf-reg-source-list" data-regulation-sources><div class="kf-live-empty">Comprobando fuentes oficiales…</div></div></details><p class="kf-reg-method" data-regulation-methodology>La accesibilidad de una fuente no equivale a revisión jurídica.</p></div></section>
    </main>`;
  }

  function recordCard(type,item,index){
    const source=item.source?item.source.type:'Fuente pendiente';
    return `<a class="kf-record" href="${profileUrl(type,item.id)}" data-record data-name="${escapeHtml(item.name.toLowerCase())}" data-status="${item.status}" data-reveal><div class="kf-record-top"><span class="kf-record-id">${String(index+1).padStart(2,'0')} / ${type}</span>${statusBadge(item.status)}</div><h2>${item.name}</h2><p>${item.subtitle}</p><div class="kf-record-foot"><span class="kf-record-source">${source}</span><span class="kf-record-link">Abrir ficha →</span></div></a>`;
  }

  function bankAssetsCompact(value){
    return `${new Intl.NumberFormat('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(value)/1000)} billones US$`;
  }

  const BANK_DIGITAL_FACTS={
    'jpmorgan-chase':{
      'Escala publicada':'>3 billones US$ de volumen acumulado y >7.000 M US$ de volumen medio diario en Kinexys',
      'Rail y disponibilidad':'Blockchain Deposit Accounts, pagos programables, FX onchain y activos tokenizados · operación 24/7/365'
    },
    'hsbc':{
      'Productos y rails':'HSBC Orion · oro tokenizado · custodia de valores tokenizados · depósitos tokenizados HKD/USD',
      'Última señal publicada':'20 ago 2026 · primera transacción de depósitos tokenizados mediante el ledger blockchain de Swift; servicio ampliado a EE. UU. en abril de 2026'
    },
    'credit-agricole':{
      'Autorización':'CACEIS Bank autorizada bajo MiCA para custodia, administración, transferencia y recepción/transmisión de órdenes',
      'Cobertura regulatoria':'Pasaporte europeo para prestar esos servicios en países de la Unión Europea'
    },
    'mufg':{
      'Infraestructura':'Progmat · emisión y gestión de security tokens, utility tokens y stablecoins',
      'Estado de la evidencia':'Arquitectura documentada por MUFG; disponibilidad depende del producto, entidad y jurisdicción'
    },
    'citigroup':{
      'Infraestructura':'CIDAP · emisión, transferencia, custodia y programación en redes públicas y privadas',
      'Estado operativo':'Token Services for Cash 24/7 entre sucursales participantes; Token Services for Trade continúa identificado como piloto'
    },
    'banco-santander':{
      'Operación observada':'Bono de 20 M US$ emitido en Ethereum público, con efectivo y cupones también tokenizados',
      'Alcance':'Operación institucional de 2019; no prueba una oferta minorista actual'
    },
    'societe-generale':{
      'Productos y redes':'EUR y USD CoinVertible · bonos digitales · productos estructurados sobre Ethereum y Tezos',
      'Última señal publicada':'Mayo de 2026 · expansión de CoinVertible a Canton y participación en liquidación europea de valores tokenizados'
    },
    'goldman-sachs':{
      'Infraestructura':'GS DAP · infraestructura DLT para mercados de capitales digitales y múltiples clases de activo',
      'Estado corporativo':'Plan de separación como compañía independiente anunciado en 2024, sujeto a aprobaciones regulatorias'
    },
    'deutsche-bank':{
      'Arquitectura':'Project DAMA 2 · Ethereum público, L2 institucional con privacidad ZK y distribución multichain mediante Axelar',
      'Estado':'Blueprint y MVP no comercial; no debe mostrarse como servicio de producción disponible'
    },
    'ubs':{
      'Producción observada':'Flujo end-to-end de fondo tokenizado ejecutado en producción en 2025; uMINT fue lanzado sobre Ethereum en 2024',
      'Instrumentos':'Fondos, bonos, warrants, notas estructuradas y repos tokenizados'
    }
  };

  const BANK_SELECTION_FACTS={
    'jpmorgan-chase':{serviceState:'EN PRODUCCIÓN',settlement:'Depósitos blockchain y pagos 24/7/365',network:'Kinexys · red institucional',risk:'Costes, mínimos y SLA no publicados'},
    'hsbc':{serviceState:'EN PRODUCCIÓN',settlement:'Valores y depósitos tokenizados',network:'HSBC Orion · integración Swift publicada',risk:'Disponibilidad sujeta a país y cliente'},
    'credit-agricole':{legal:'CACEIS Bank · autorización MiCA',legalNote:'Custodia, administración, transferencia y órdenes',serviceState:'AUTORIZADO',settlement:'Custodia y transferencia institucional',network:'Red según activo y operación',risk:'Tarifas y subcustodios según contrato'},
    'mufg':{serviceState:'INFRAESTRUCTURA PUBLICADA',settlement:'Emisión y gestión de activos tokenizados',network:'Progmat · red según emisión',risk:'Disponibilidad por producto y jurisdicción'},
    'citigroup':{serviceState:'EN PRODUCCIÓN / PILOTO',settlement:'Depósitos tokenizados y trade finance',network:'CIDAP · redes públicas y privadas',risk:'Entidad, precio y SLA según contrato'},
    'banco-santander':{serviceState:'OPERACIÓN PUBLICADA',settlement:'Bono, efectivo y cupones tokenizados',network:'Ethereum público · operación de 2019',risk:'No prueba oferta contratable actual'},
    'societe-generale':{serviceState:'EN PRODUCCIÓN',settlement:'Stablecoins, bonos y productos estructurados',network:'Ethereum · Tezos · Canton',risk:'Acceso, liquidez y tarifas institucionales'},
    'goldman-sachs':{serviceState:'INFRAESTRUCTURA PUBLICADA',settlement:'Mercados de capitales digitales',network:'GS DAP · DLT institucional',risk:'Estructura corporativa y costes por confirmar'},
    'deutsche-bank':{serviceState:'MVP / BLUEPRINT',settlement:'Custodia y distribución multichain',network:'Ethereum · L2 institucional · Axelar',risk:'No presentado como servicio comercial'},
    'ubs':{serviceState:'PRODUCCIÓN OBSERVADA',settlement:'Fondos, bonos, notas y repos tokenizados',network:'UBS Tokenize · Ethereum y rails institucionales',risk:'Elegibilidad, custodio y precio según operación'}
  };

  function itemSources(item){
    const redirects={
      'https://www.hsbc.com/who-we-are/our-businesses-and-customers/hsbc-orion':'https://www.hsbc.com/who-we-are/hsbc-and-digital/hsbc-and-digital-assets-and-currencies',
      'https://www.caceis.com/whats-new/news/spotlight/article/caceis-bank-registered-as-a-digital-assets-service-provider/detail.html':'https://www.caceis.com/press-releases/caceis-bank-obtains-mica-authorisation',
      'https://www.mufg.jp/english/profile/strategy/dx/digital_asset/index.html':'https://www.mufg.jp/dam/ir/presentation/2023/pdf/slides2309_en.pdf',
      'https://www.citigroup.com/global/news/press-release/2023/citi-develops-digital-asset-capabilities-for-institutional-clients':'https://www.citigroup.com/global/businesses/digital-assets',
      'https://www.santander.com/en/press-room/press-releases/2019/09/santander-launches-the-first-end-to-end-blockchain-bond':'https://www.santander.com/en/press-room/press-releases/santander-launches-the-first-end-to-end-blockchain-bond',
      'https://www.goldmansachs.com/what-we-do/FICC-and-equities/digital-assets':'https://www.goldmansachs.com/pressroom/press-releases/2024/announcement-18-nov-2024',
      'https://www.db.com/news/detail/20230620-deutsche-bank-applies-for-digital-assets-license':'https://corporates.db.com/more/latest-news/next-phase-of-project-dama-unveils-institutional-blueprint-for-digital-asset-servicing'
    };
    const normalize=(source)=>source?{...source,url:redirects[source.url]||source.url}:source;
    if(item.sources?.length)return item.sources.map(normalize);
    const sources=[item.source].filter(Boolean);
    if(item.bank?.activity==='Infraestructura e-CNY')sources.push({name:'People\'s Bank of China · e-CNY',url:'https://www.pbc.gov.cn/en/3688110/3688172/4157443/4293696/2021072014364791207.pdf',type:'Marco oficial del sistema; sin atribución individual'});
    return sources.map(normalize);
  }

  function bankDisplay(item){
    const bank={...item.bank};
    const eCny=bank.activity==='Infraestructura e-CNY';
    const hasSpecificSource=(item.sources||[]).length>1;
    if(eCny){
      bank.activity='e-CNY · contexto sectorial';
      bank.activityLevel='Sin atribución individual';
    }else if(!hasSpecificSource){
      bank.activity='Sin producto vinculado';
      bank.activityLevel='Cobertura pendiente';
      bank.custody='No verificada como servicio público';
      bank.access='Sin alcance digital publicado';
    }
    return bank;
  }

  function bankComparison(item){
    const bank=bankDisplay(item);
    const specific=(item.sources||[]).length>1;
    const fact=BANK_SELECTION_FACTS[item.id]||{};
    const defaultState=bank.activityLevel==='Sin atribución individual'?'CONTEXTO SECTORIAL':specific?'INICIATIVA PUBLICADA':'NO VERIFICADO';
    const custodyKnown=!/^(No verificada|No publicada)/i.test(bank.custody||'');
    return {
      legal:fact.legal||'Entidad prestadora no identificada',
      legalNote:fact.legalNote||`${bank.country} · verificar entidad y autorización del servicio`,
      service:bank.activity,
      serviceState:fact.serviceState||defaultState,
      custody:custodyKnown?bank.custody:'No verificada',
      custodyNote:custodyKnown?'Segregación y subcustodios según contrato':'Sin evidencia suficiente en la fuente vinculada',
      settlement:fact.settlement||'No publicado',
      network:fact.network||'Red y firmeza de liquidación no publicadas',
      risk:fact.risk||'No evaluable con la evidencia actual',
      cost:'Coste total no publicado'
    };
  }

  function bankFields(item){
    const bank=bankDisplay(item);
    const comparison=bankComparison(item);
    const fields={...(item.fields||{})};
    if(bank.activityLevel==='Sin atribución individual')fields['Actividad blockchain pública']='El PBOC documenta un sistema de operadores bancarios e-CNY; esta ficha no atribuye una función concreta al banco.';
    if(bank.activityLevel==='Cobertura pendiente'){
      fields['Actividad blockchain pública']='Sin producto operativo enlazado a fuente primaria en este corte';
      fields['Custodia de criptoactivos']='No verificada como servicio público';
      fields['Acceso']='Sin alcance digital publicado';
    }
    const source=BANK_INTELLIGENCE?.official_sources?.find((entry)=>entry.bank_id===item.id);
    if(source){
      fields['Última comprobación automática']=new Intl.DateTimeFormat('es-ES',{dateStyle:'medium',timeZone:'Europe/Madrid'}).format(new Date(source.checked_at));
      fields['Estado técnico de la fuente']=source.connection_status==='CONNECTED'?'Fuente corporativa accesible':'Fuente temporalmente no accesible; se conserva el último hecho validado';
    }
    fields['Entidad y autorización']=`${comparison.legal} · ${comparison.legalNote}`;
    fields['Servicio y estado']=`${comparison.serviceState} · ${comparison.service}`;
    fields['Custodia y protección']=`${comparison.custody} · ${comparison.custodyNote}`;
    fields['Liquidación y redes']=`${comparison.settlement} · ${comparison.network}`;
    fields['Riesgo y coste']=`${comparison.risk} · ${comparison.cost}`;
    return {...fields,...(BANK_DIGITAL_FACTS[item.id]||{})};
  }

  function bankIntelligenceMarkup(banks){
    const totalAssets=banks.reduce((sum,item)=>sum+Number(item.bank.assets||0),0);
    const sourced=banks.filter((item)=>(item.sources||[]).length>1);
    const topFourAssets=banks.slice(0,4).reduce((sum,item)=>sum+Number(item.bank.assets||0),0);
    const regions=['Asia-Pacífico','Europa','América'].map((region)=>{
      const subset=banks.filter((item)=>item.bank.region===region);
      const assets=subset.reduce((sum,item)=>sum+Number(item.bank.assets||0),0);
      return {region,count:subset.length,assets,share:assets/totalAssets*100};
    });
    const percent=(value)=>new Intl.NumberFormat('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1}).format(value);
    const regionBars=regions.map((item)=>`<i style="--bank-share:${item.share}%" title="${escapeHtml(item.region)}: ${percent(item.share)} %"></i>`).join('');
    const regionRows=regions.map((item)=>`<li><span>${escapeHtml(item.region)}</span><strong>${percent(item.share)} %</strong><small>${item.count} bancos · ${bankAssetsCompact(item.assets)}</small></li>`).join('');
    const signals=[
      ['J.P. Morgan · Kinexys','>3 billones US$ procesados','>7.000 M US$ de media diaria · infraestructura 24/7/365','https://www.jpmorgan.com/onyx'],
      ['HSBC · depósitos tokenizados','Expansión a EE. UU. en 2026','20 ago 2026 · primera operación mediante el ledger blockchain de Swift','https://www.hsbc.com/who-we-are/hsbc-and-digital/hsbc-and-digital-assets-and-currencies'],
      ['CACEIS · MiCA','Custodia con pasaporte UE','Custodia, órdenes y transferencias autorizadas desde 30 jun 2025','https://www.caceis.com/press-releases/caceis-bank-obtains-mica-authorisation'],
      ['UBS Tokenize','Fondo tokenizado en producción','Flujo completo de suscripción y reembolso publicado en 2025','https://www.ubs.com/global/en/investment-bank/tokenize.html']
    ];
    const signalCards=signals.map(([name,value,note,url])=>`<article><span>${escapeHtml(name)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small><a href="${url}" target="_blank" rel="noopener noreferrer">Fuente ↗</a></article>`).join('');
    const generated=BANK_INTELLIGENCE?.generated_at?new Intl.DateTimeFormat('es-ES',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Madrid'}).format(new Date(BANK_INTELLIGENCE.generated_at)):'pendiente';
    const edition=BANK_INTELLIGENCE?.ranking?.edition||'edición vigente';
    const connected=BANK_INTELLIGENCE?.data_quality?.connected_official_sources;
    const sourceTotal=BANK_INTELLIGENCE?.data_quality?.official_source_count;
    const changed=BANK_INTELLIGENCE?.data_quality?.changed_official_sources||0;
    return `<section class="kf-bank-intelligence" aria-labelledby="bank-registry-title">
      <header><div><p class="kf-kicker">Datos bancarios conectados</p><h2 id="bank-registry-title">Escala y actividad blockchain del Top 25.</h2><small>Actualización semanal automática · ${escapeHtml(edition)} · comprobado ${escapeHtml(generated)}${Number.isFinite(connected)?` · ${connected}/${sourceTotal} fuentes corporativas accesibles`:''}${changed?` · ${changed} cambios de fuente detectados`:''}</small></div><a href="${escapeHtml(BANK_INTELLIGENCE?.ranking?.url||'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/the-worlds-largest-banks-by-assets-2026')}" target="_blank" rel="noopener noreferrer">Ranking y metodología S&amp;P Global ↗</a></header>
      <div class="kf-bank-kpis"><article><strong>${bankAssetsCompact(totalAssets)}</strong><span>activos agregados</span><small>Suma del Top 25 · ${escapeHtml(edition)}</small></article><article><strong>${sourced.length} / ${banks.length}</strong><span>producto o infraestructura con fuente primaria</span><small>No se cuenta el contexto e-CNY sin atribución individual</small></article><article><strong>${percent(topFourAssets/totalAssets*100)} %</strong><span>del balance en los cuatro mayores bancos chinos</span><small>Concentración dentro de esta muestra</small></article><article><strong>${banks.length-sourced.length} / ${banks.length}</strong><span>sin producto concreto vinculado</span><small>Hueco documental, no ausencia demostrada</small></article></div>
      <div class="kf-bank-analysis"><section><header><strong>Activos por región</strong><span>Cuota dentro de ${bankAssetsCompact(totalAssets)}</span></header><div class="kf-bank-region-bar" aria-hidden="true">${regionBars}</div><ul>${regionRows}</ul></section><section><header><strong>Infraestructura bancaria identificada</strong><span>Productos con fuente corporativa; categorías no excluyentes</span></header><dl><div><dt>Dinero y pagos</dt><dd>Kinexys · HSBC Tokenised Deposits · Citi Token Services</dd></div><div><dt>Valores y fondos</dt><dd>HSBC Orion · Progmat · Santander · SG-FORGE · GS DAP · DAMA 2 · UBS Tokenize</dd></div><div><dt>Custodia y servicing</dt><dd>CACEIS · Citi CIDAP · SG-FORGE · DAMA 2 · UBS Tokenize</dd></div></dl></section></div>
      <div class="kf-bank-signals"><header><strong>Datos que cambian la lectura</strong><span>Últimos hechos cuantificables o con cambio de estado hallados en fuentes corporativas</span></header><div>${signalCards}</div></div>
    </section>`;
  }

  function bankRegistryMarkup(){
    const banks=CATALOGS.bancos.items.slice().sort((a,b)=>a.bank.rank-b.bank.rank);
    const regions=[...new Set(banks.map((item)=>item.bank.region))];
    const rows=banks.map((item)=>{
      const bank=bankDisplay(item);
      const comparison=bankComparison(item);
      const sources=itemSources(item);
      const facts=Object.entries(bankFields(item)).map(([key,value])=>`<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
      const sourceLinks=sources.map((source)=>`<a href="${source.url}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(source.name)}</strong><span>${escapeHtml(source.type)} ↗</span></a>`).join('');
      const search=[item.name,item.subtitle,bank.country,bank.region,...Object.values(comparison)].join(' ').toLowerCase();
      const serviceClass=['NO VERIFICADO','CONTEXTO SECTORIAL','MVP / BLUEPRINT','OPERACIÓN PUBLICADA'].includes(comparison.serviceState)?' pending':'';
      return `<details class="kf-bank-row" data-bank-record data-bank-region="${escapeHtml(bank.region)}" data-bank-search="${escapeHtml(search)}"><summary><span class="kf-bank-identity"><b>${String(bank.rank).padStart(2,'0')}</b><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(bank.country)} · ${bankAssetsCompact(bank.assets)}</small></span></span><span class="kf-bank-legal"><strong>${escapeHtml(comparison.legal)}</strong><small>${escapeHtml(comparison.legalNote)}</small></span><span class="kf-bank-service${serviceClass}"><strong>${escapeHtml(comparison.serviceState)}</strong><small>${escapeHtml(comparison.service)}</small></span><span class="kf-bank-custody"><strong>${escapeHtml(comparison.custody)}</strong><small>${escapeHtml(comparison.custodyNote)}</small></span><span class="kf-bank-settlement"><strong>${escapeHtml(comparison.settlement)}</strong><small>${escapeHtml(comparison.network)}</small></span><span class="kf-bank-risk"><strong>${escapeHtml(comparison.risk)}</strong><small>${escapeHtml(comparison.cost)}</small></span><span class="kf-bank-open"><i aria-hidden="true"></i></span></summary><div class="kf-bank-detail"><dl>${facts}</dl><aside><span>Fuentes de la ficha</span>${sourceLinks}<a class="kf-bank-profile-link" href="${profileUrl('bancos',item.id)}">Abrir ficha completa →</a></aside></div></details>`;
    }).join('');
    return `${bankIntelligenceMarkup(banks)}<section class="kf-bank-registry" aria-label="Comparador de los 25 mayores bancos"><div class="kf-bank-tools"><label><span>Buscar banco, país o iniciativa</span><input type="search" data-bank-search placeholder="Ej. Santander, Japón, tokenización…"></label><label><span>Región</span><select data-bank-region><option value="all">Todas</option>${regions.map((region)=>`<option value="${escapeHtml(region)}">${escapeHtml(region)}</option>`).join('')}</select></label><span class="kf-bank-count" data-bank-count>${banks.length} bancos</span></div><div class="kf-bank-columns" aria-hidden="true"><span>Banco y escala</span><span>Entidad y autorización</span><span>Servicio real</span><span>Custodia</span><span>Liquidación y redes</span><span>Riesgo y coste</span><span></span></div><div class="kf-bank-list">${rows}<p class="kf-bank-empty" data-bank-empty hidden>No hay bancos que coincidan con el filtro.</p></div><p class="kf-bank-caveat"><strong>Cómo elegir:</strong> el puesto y los activos solo describen escala. La decisión exige confirmar la entidad contractual, autorización exacta, disponibilidad real, segregación y devolución de activos, firmeza de liquidación, dependencias, precio y SLA. «No publicado» nunca se interpreta como cumplido.</p></section>`;
  }

  function walletHeroMarkup(){
    return `<header class="kf-wallet-hero"><div class="kf-container kf-wallet-hero-grid"><div class="kf-wallet-hero-copy"><p class="kf-kicker">Autocustodia y firma</p><h1>Wallets</h1><p>Compara dónde se guarda la clave, cómo se confirma una transacción y cómo se recupera el acceso.</p><dl><div><dt>Clave</dt><dd>quién la controla</dd></div><div><dt>Firma</dt><dd>qué muestra el dispositivo</dd></div><div><dt>Copia</dt><dd>cómo se recupera</dd></div></dl></div><figure><img src="${assetUrl('/assets/images/wallet-security-v2.jpg')}" alt="Hardware wallet mostrando la revisión de una transacción de Bitcoin" width="1672" height="941"><figcaption>La dirección y el importe deben verificarse en la pantalla del dispositivo.</figcaption></figure></div></header>`;
  }

  function walletIntelligenceMarkup(){
    const devices=[
      {id:'ngrave-zero',name:'NGRAVE ZERO',label:'Mayor aislamiento',best:'Custodia prolongada',isolation:'Firma por QR; sin USB, Bluetooth ni Wi-Fi para transacciones',certification:'SO con CC EAL7, según NGRAVE',verification:'Pantalla táctil de 4 pulgadas',recovery:'Perfect Key · GRAPHENE opcional',source:'https://ngrave.io/en/page/backup/zero/'},
      {id:'ledger',name:'Ledger Flex',label:'Mayor integración',best:'Uso multichain frecuente',isolation:'USB-C, Bluetooth y NFC',certification:'Secure Element CC EAL6+',verification:'Pantalla E Ink segura de 2,84 pulgadas',recovery:'Frase de recuperación · Recovery Key',source:'https://www.ledger.com/academy/topics/crypto/which-ledger-signer-should-i-buy'},
      {id:'trezor',name:'Trezor Safe 5',label:'Mayor apertura',best:'Código abierto y uso cableado',isolation:'USB-C; sin Bluetooth',certification:'Secure Element EAL6+',verification:'Pantalla táctil y respuesta háptica',recovery:'12, 20 o 24 palabras · copia multishare',source:'https://trezor.io/trezor-safe-5'}
    ];
    const criterion=(label,key)=>`<div class="kf-wallet-criterion"><strong>${label}</strong>${devices.map((device,index)=>`<span class="${index===0?'featured':''}">${escapeHtml(device[key])}</span>`).join('')}</div>`;
    return `<section class="kf-wallet-intel" aria-labelledby="wallet-compare-title"><div class="kf-wallet-heading"><div><p class="kf-kicker">Hardware</p><h2 id="wallet-compare-title">Tres opciones, cinco diferencias.</h2></div><p>NGRAVE prioriza aislamiento. Ledger prioriza integraciones. Trezor combina hardware certificado y código abierto.</p></div><div class="kf-wallet-matrix"><div class="kf-wallet-products"><span></span>${devices.map((device,index)=>`<a class="${index===0?'featured':''}" href="${profileUrl('wallets',device.id)}"><small>${escapeHtml(device.label)}</small><strong>${escapeHtml(device.name)}</strong><i>Ver ficha →</i></a>`).join('')}</div>${criterion('Uso principal','best')}${criterion('Conexión','isolation')}${criterion('Certificación','certification')}${criterion('Confirmación','verification')}${criterion('Recuperación','recovery')}</div><p class="kf-wallet-cert-note"><strong>Cómo leer EAL:</strong> mide el alcance evaluado de un componente o sistema; no es una puntuación total de seguridad ni sustituye la gestión de copias y firmas.</p><div class="kf-wallet-use"><article><span>Wallet software</span><strong>MetaMask</strong><p>Para operación frecuente. No sustituye un signer hardware para conservar importes relevantes.</p><a href="${profileUrl('wallets','metamask')}">Ver ficha →</a></article><article><span>Tesorería compartida</span><strong>Safe Smart Account</strong><p>Para varios firmantes, umbrales y políticas. La seguridad depende de propietarios, módulos y recuperación.</p><a href="${profileUrl('wallets','safe')}">Ver ficha →</a></article><aside><span>Antes de transferir</span><ol><li>Compra al fabricante o distribuidor autorizado.</li><li>Comprueba la dirección en la pantalla del signer.</li><li>Prueba la recuperación antes de depositar.</li></ol></aside></div><nav class="kf-wallet-sources" aria-label="Fuentes oficiales de la comparación">${devices.map((device)=>`<a href="${device.source}" target="_blank" rel="noopener noreferrer">${escapeHtml(device.name)} · fuente oficial ↗</a>`).join('')}</nav></section>`;
  }

  function web3ArchitectureMarkup(){
    const layers=[
      {code:'01',name:'Liquidación',copy:'Quién ordena y finaliza el estado.',items:['Ethereum']},
      {code:'02',name:'Escalado',copy:'Dónde se ejecuta y cómo se puede salir.',items:['Arbitrum One','L2BEAT']},
      {code:'03',name:'Datos externos',copy:'Qué información entra y quién la valida.',items:['Chainlink']},
      {code:'04',name:'Datos persistentes',copy:'Dónde se direcciona, conserva y recupera.',items:['IPFS','Filecoin']},
      {code:'05',name:'Indexación',copy:'Quién transforma la cadena en consultas útiles.',items:['The Graph']},
      {code:'06',name:'Identidad',copy:'Cómo se resuelve una identidad a una dirección.',items:['ENS']}
    ];
    return `<section class="kf-web3-map"><div class="kf-intel-lead"><div><p class="kf-kicker">Infraestructura Web3</p><h2>Una aplicación descentralizada sigue teniendo dependencias.</h2></div><p>Kaufman no clasifica un proyecto por su token. Lo sitúa en la función que resuelve y muestra qué debe verificarse: contratos, operadores, proveedores de datos, almacenamiento, governance y ruta de salida.</p></div><div class="kf-web3-flow">${layers.map((layer,index)=>`<article><span>${layer.code}</span><div><small>${index===0?'ORIGEN':index===layers.length-1?'INTERFAZ':'CAPA'}</small><h3>${layer.name}</h3><p>${layer.copy}</p><strong>${layer.items.join(' · ')}</strong></div></article>`).join('')}</div><div class="kf-subsection-label">Telemetría de dependencias</div><div class="kf-web3-telemetry" data-web3-telemetry><div class="kf-live-empty">Observando cadena, contratos, gateways y releases…</div></div><div class="kf-decentralization-rule"><div><span>DESCENTRALIZACIÓN</span><strong>No es una etiqueta binaria.</strong></div><ol><li><b>Control</b><span>Quién puede actualizar, pausar o censurar.</span></li><li><b>Verificación</b><span>Qué puede comprobar el usuario sin confiar en la interfaz.</span></li><li><b>Disponibilidad</b><span>Qué ocurre si falla un operador, RPC, indexador o proveedor.</span></li><li><b>Salida</b><span>Si existe una ruta para recuperar control o fondos.</span></li></ol></div><div class="kf-intel-evidence"><p><strong>Criterio de inclusión:</strong> una pieza ocupa una función diferenciada del stack y dispone de documentación técnica primaria o de una matriz pública conectada. No es un ranking ni una recomendación.</p><nav><a href="https://ethereum.org/developers/docs/" target="_blank" rel="noopener noreferrer">Stack Ethereum ↗</a><a href="https://docs.ipfs.tech/concepts/what-is-ipfs/" target="_blank" rel="noopener noreferrer">Qué es —y qué no es— IPFS ↗</a><a href="https://thegraph.com/docs/en/about/" target="_blank" rel="noopener noreferrer">Indexación onchain ↗</a></nav></div></section>`;
  }

  function miningCalculatorMarkup(){
    return `<div class="kf-mining-calculator-grid"><form class="kf-calculator-controls kf-mining-controls" data-mining-calculator><div class="kf-field"><label for="mining-hardware">Equipo</label><select class="kf-select" id="mining-hardware" data-calc-hardware><option value="s21-xp">Antminer S21 XP · aire</option><option value="s21-xp-hyd">Antminer S21 XP Hyd · hidráulica</option><option value="s21">Antminer S21 · aire</option></select></div><input type="hidden" value="manual" data-calc-country><div class="kf-field"><label for="mining-electricity">Electricidad · USD/kWh</label><input id="mining-electricity" data-calc-electricity inputmode="decimal" type="number" min="0" step="0.001" value="0.08"><small>Introduce la tarifa total de tu contrato.</small></div><div class="kf-field"><label for="mining-uptime">Disponibilidad · %</label><input id="mining-uptime" data-calc-uptime inputmode="decimal" type="number" min="0" max="100" step="0.1" value="97"></div><div class="kf-field"><label for="mining-pool">Comisión de pool · %</label><input id="mining-pool" data-calc-pool inputmode="decimal" type="number" min="0" max="100" step="0.1" value="2"></div><div class="kf-field"><label for="mining-cooling">Refrigeración adicional · %</label><input id="mining-cooling" data-calc-cooling inputmode="decimal" type="number" min="0" step="0.1" value="8"></div><div class="kf-field"><label for="mining-hardware-cost">Coste del equipo · USD</label><input id="mining-hardware-cost" data-calc-hardware-cost inputmode="decimal" type="number" min="0" step="1" placeholder="Opcional"></div><div class="kf-calc-source" data-calc-status>Cargando red, precio y recompensa…</div></form><section class="kf-calculator-output"><div class="kf-calc-kpi"><span>Ingreso bruto / día</span><strong data-calc-gross>—</strong></div><div class="kf-calc-kpi"><span>Consumo / día</span><strong data-calc-energy>—</strong></div><div class="kf-calc-kpi"><span>Electricidad / día</span><strong data-calc-power-cost>—</strong></div><div class="kf-calc-kpi primary"><span>Resultado / día</span><strong data-calc-profit>—</strong></div><div class="kf-calc-kpi"><span>Resultado / 30 días</span><strong data-calc-profit-month>—</strong></div><div class="kf-calc-kpi"><span>Recuperación del equipo</span><strong data-calc-payback>Introduce coste</strong></div><p>Antes de impuestos, financiación, averías, reparaciones, aranceles y cambios futuros de precio, dificultad o comisiones.</p></section></div><div class="kf-mining-sensitivity"><header><div><span>Sensibilidad al precio eléctrico</span><strong data-mining-sensitivity-title>Resultado diario</strong></div><small>USD/día · resto de variables sin cambios</small></header><div data-mining-sensitivity-chart><div class="kf-live-empty">Esperando cálculo…</div></div></div>`;
  }

  function miningWorkbenchMarkup(){
    return '<div class="kf-mining-workbench">'
      +'<form class="kf-mining-allin-controls" data-mining-calculator>'
        +'<div class="kf-mining-control-group"><header><span>01</span><strong>Flota</strong></header>'
          +'<div class="kf-field wide"><label for="mining-hardware-v2">Equipo</label><select class="kf-select" id="mining-hardware-v2" data-calc-hardware><option value="">Cargando catálogo…</option></select></div>'
          +'<div class="kf-field"><label for="mining-units">Unidades</label><input id="mining-units" data-calc-units inputmode="numeric" type="number" min="1" step="1" value="100"></div>'
          +'<div class="kf-field"><label for="mining-hardware-cost-v2">ASIC / unidad · US$</label><input id="mining-hardware-cost-v2" data-calc-hardware-cost inputmode="decimal" type="number" min="0" step="1" value="0"><small>Introduce la cotización real del lote.</small></div>'
          +'<div class="kf-field"><label for="mining-logistics">Logística / unidad · US$</label><input id="mining-logistics" data-calc-logistics inputmode="decimal" type="number" min="0" step="1" value="0"></div>'
        +'</div>'
        +'<div class="kf-mining-control-group"><header><span>02</span><strong>Energía y operación</strong></header>'
          +'<div class="kf-field"><label for="mining-electricity-v2">Coste eléctrico all-in · US$/kWh</label><input id="mining-electricity-v2" data-calc-electricity inputmode="decimal" type="number" min="0" step="0.0001" value="0.0555"><small>Referencia editable: mediana industrial CCAF 2025.</small></div>'
          +'<div class="kf-field"><label for="mining-demand">Hosting y demanda adicional · US$/kWh</label><input id="mining-demand" data-calc-demand inputmode="decimal" type="number" min="0" step="0.001" value="0"></div>'
          +'<div class="kf-field"><label for="mining-pue">PUE de instalación</label><input id="mining-pue" data-calc-pue inputmode="decimal" type="number" min="1" step="0.01" value="1"><small>Potencia total ÷ potencia de los ASIC; 1 evita asumir sobreconsumo.</small></div>'
          +'<div class="kf-field"><label for="mining-uptime-v2">Disponibilidad · %</label><input id="mining-uptime-v2" data-calc-uptime inputmode="decimal" type="number" min="0" max="100" step="0.1" value="100"></div>'
          +'<div class="kf-field"><label for="mining-curtailment">Curtailment · h/mes</label><input id="mining-curtailment" data-calc-curtailment inputmode="decimal" type="number" min="0" max="720" step="1" value="0"></div>'
          +'<div class="kf-field"><label for="mining-pool-v2">Comisión de pool · %</label><input id="mining-pool-v2" data-calc-pool inputmode="decimal" type="number" min="0" max="100" step="0.1" value="2.5"></div>'
        +'</div>'
        +'<div class="kf-mining-control-group"><header><span>03</span><strong>Costes no eléctricos</strong></header>'
          +'<div class="kf-field"><label for="mining-maintenance">Mantenimiento · US$/ASIC/mes</label><input id="mining-maintenance" data-calc-maintenance inputmode="decimal" type="number" min="0" step="1" value="0"></div>'
          +'<div class="kf-field"><label for="mining-finance">Financiación · US$/mes</label><input id="mining-finance" data-calc-finance inputmode="decimal" type="number" min="0" step="1" value="0"></div>'
          +'<div class="kf-field"><label for="mining-other">Otros costes · US$/mes</label><input id="mining-other" data-calc-other inputmode="decimal" type="number" min="0" step="1" value="0"></div>'
          +'<div class="kf-calc-source wide" data-calc-status>Cargando red, precio y especificaciones…</div>'
        +'</div>'
      +'</form>'
      +'<section class="kf-mining-allin-output" aria-live="polite">'
        +'<header><span>Cálculo de tu operación</span><strong data-calc-model-name>—</strong></header>'
        +'<div class="kf-mining-output-grid">'
          +'<div><span>Hashrate de flota</span><strong data-calc-fleet-hashrate>—</strong></div>'
          +'<div><span>Carga total</span><strong data-calc-fleet-load>—</strong></div>'
          +'<div><span>Producción / mes</span><strong data-calc-btc-month>—</strong></div>'
          +'<div><span>Ingreso bruto / día</span><strong data-calc-gross>—</strong></div>'
          +'<div><span>Coste total / día</span><strong data-calc-allin-cost>—</strong></div>'
          +'<div class="primary"><span>Resultado / día</span><strong data-calc-profit>—</strong></div>'
          +'<div><span>Resultado / 30 días</span><strong data-calc-profit-month>—</strong></div>'
          +'<div><span>Coste operativo / BTC</span><strong data-calc-cost-btc>—</strong></div>'
          +'<div><span>Energía directa de equilibrio</span><strong data-calc-btc-breakeven>—</strong></div>'
          +'<div><span>Dificultad tolerable</span><strong data-calc-difficulty-headroom>—</strong></div>'
          +'<div><span>CAPEX declarado</span><strong data-calc-capex>—</strong></div>'
          +'<div><span>Recuperación de CAPEX</span><strong data-calc-payback>—</strong></div>'
        +'</div>'
        +'<p>Cálculo antes de impuestos sobre beneficios y sin atribuir valor residual. Todos los costes introducidos permanecen en este navegador.</p>'
      +'</section>'
    +'</div>'
    +'<section class="kf-mining-scenario-panel">'
      +'<header><div><span>Matriz de estrés</span><strong>Precio BTC × dificultad de red</strong></div><small>Resultado mensual de la flota · resto de entradas constante</small></header>'
      +'<div class="kf-mining-scenario-matrix" data-mining-scenario-matrix><div class="kf-live-empty">Esperando cálculo…</div></div>'
    +'</section>'
    +'<section class="kf-mining-sensitivity"><header><div><span>Sensibilidad eléctrica all-in</span><strong data-mining-sensitivity-title>Resultado diario</strong></div><small>Incluye PUE, hosting, mantenimiento y costes mensuales declarados</small></header><div data-mining-sensitivity-chart><div class="kf-live-empty">Esperando cálculo…</div></div></section>'
    +'<section class="kf-mining-actions">'
      +'<div><span>Datos de tu operación</span><strong>Guarda, comparte o exporta las cifras introducidas.</strong></div>'
      +'<nav><button type="button" data-mining-save>Guardar en este navegador</button><button type="button" data-mining-share>Copiar enlace</button><button type="button" data-mining-export>Exportar CSV</button></nav>'
      +'<small data-mining-action-status aria-live="polite">No se envían datos a Kaufman.</small>'
    +'</section>'
    +'<section class="kf-mining-alerts">'
      +'<header><div><span>Umbrales locales</span><strong>Controla cuándo cambia la decisión.</strong></div><small>Se evalúan al abrir la página; no envían correo ni funcionan con el navegador cerrado.</small></header>'
      +'<div class="kf-mining-alert-controls"><label>Hashprice mínimo · US$/PH/día<input data-alert-hashprice-min type="number" min="0" step="1" value="35"></label><label>Coste eléctrico máximo · US$/kWh<input data-alert-electricity-max type="number" min="0" step="0.001" value="0.08"></label><label>Margen mensual mínimo · US$<input data-alert-margin-min type="number" step="100" value="0"></label><button type="button" data-mining-alert-save>Guardar umbrales</button></div>'
      +'<div class="kf-mining-alert-results" data-mining-alert-results><span>Esperando cálculo…</span></div>'
    +'</section>';
  }

  function renderMiningV2(){
    const heroImage=assetUrl('/assets/images/mining-operations-hero-v1.jpg');
    return '<main class="kf-main kf-mining-page" id="main-content">'
      +'<header class="kf-mining-hero"><div class="kf-container"><div class="kf-breadcrumbs"><a href="/">Inicio</a><span>/</span><span>Minería de Bitcoin</span></div><div class="kf-mining-hero-frame"><div class="kf-mining-hero-copy"><div class="kf-mining-hero-topline"><p class="kf-kicker">Bitcoin · SHA-256</p><span class="kf-mining-live"><i aria-hidden="true"></i><span data-mining-hero-cadence>Precio 5 min · red 30 min</span></span></div><h1>Minería de Bitcoin</h1><p class="kf-mining-hero-deck">Red, flota y coste total para saber qué variable convierte una instalación en margen o pérdida.</p><dl class="kf-mining-hero-scope"><div><dt>Red</dt><dd data-mining-hero-observed>Sincronizando snapshot…</dd></div><div><dt>Electricidad</dt><dd data-mining-hero-electricity>Esperando último periodo oficial…</dd></div></dl><nav aria-label="Contenido de minería"><a href="#red-minera">Red</a><a href="#economia-minera">Modelo económico</a><a href="#equipos-mineros">ASIC</a><a href="#pools-mineros">Pools</a><a href="#paises-mineros">Electricidad</a></nav></div><figure><div class="kf-mining-hero-media"><img src="'+heroImage+'" width="1672" height="941" alt="Instalación profesional con filas de equipos ASIC para minería de Bitcoin" fetchpriority="high"><span>ASIC · SHA-256</span></div><figcaption><strong>Infraestructura de cómputo</strong><span>Imagen ilustrativa · potencia, refrigeración y disponibilidad</span></figcaption></figure></div></div></header>'
      +'<section class="kf-section kf-mining-network" id="red-minera" data-mining-dashboard><div class="kf-container"><div class="kf-mining-section-head"><div><p class="kf-kicker">Bitcoin · economía de red</p><h2>Ingreso por hash y presión competitiva.</h2></div><p data-mining-observed>Conectando snapshot minero…</p></div>'
        +'<div class="kf-mining-freshness" aria-label="Frescura de las fuentes"><div><span>Precio BTC</span><strong data-mining-freshness="price">Conectando…</strong></div><div><span>Red y dificultad</span><strong data-mining-freshness="network">Conectando…</strong></div><div><span>Pools</span><strong data-mining-freshness="pools">Conectando…</strong></div><div><span>Electricidad</span><strong data-mining-freshness="countries">Conectando…</strong></div></div>'
        +'<div class="kf-mining-kpis-main"><article><span>Hashprice</span><strong data-mining-kpi="hashprice">—</strong><small>US$ por PH/s y día</small></article><article><span>Hashrate de red</span><strong data-mining-kpi="hashrate">—</strong><small data-mining-kpi-note="hashrate">Promedio observado</small></article><article><span>Próximo ajuste</span><strong data-mining-kpi="difficulty">—</strong><small data-mining-kpi-note="difficulty">Estimación de dificultad</small></article><article><span>Comisiones / recompensa</span><strong data-mining-kpi="fee-share">—</strong><small>Últimos 144 bloques</small></article><article><span>Intervalo de bloque</span><strong data-mining-kpi="block-time">—</strong><small>Promedio observado</small></article><article><span>Techo eléctrico teórico</span><strong data-mining-kpi="break-even">—</strong><small>S21 XP · sin otros costes</small></article></div>'
        +'<div class="kf-mining-network-grid"><section class="kf-mining-chart-panel"><header><div><span>Hashrate medio diario</span><strong data-mining-chart-summary>—</strong></div><div class="kf-range-switch" role="group" aria-label="Periodo del gráfico de hashrate"><button type="button" data-mining-range="7" aria-pressed="false">7 días</button><button type="button" data-mining-range="30" aria-pressed="true">30 días</button><button type="button" data-mining-range="90" aria-pressed="false">90 días</button></div></header><div class="kf-mining-chart" data-mining-hashrate-chart><div class="kf-live-empty">Esperando serie de red…</div></div><footer><span>EH/s · media diaria</span><a href="https://mempool.space/docs/api/rest" target="_blank" rel="noopener noreferrer">Fuente: mempool.space ↗</a></footer></section><aside class="kf-mining-decisions" data-mining-decisions><div class="kf-live-empty">Calculando señales…</div></aside></div>'
      +'</div></section>'
      +'<section class="kf-section kf-mining-economics" id="economia-minera"><div class="kf-container"><div class="kf-mining-section-head"><div><p class="kf-kicker">Flota y coste total</p><h2>Calcula los costes de tu operación minera.</h2></div><p>Introduce flota, coste eléctrico, hosting, PUE, disponibilidad, curtailment, pool, mantenimiento, financiación y CAPEX. Las cifras se recalculan con el último precio de BTC y los datos de red disponibles.</p></div>'+miningWorkbenchMarkup()+'</div></section>'
      +'<section class="kf-section kf-mining-equipment" id="equipos-mineros"><div class="kf-container"><div class="kf-mining-section-head"><div><p class="kf-kicker">Hardware SHA-256 · tres fabricantes</p><h2>Compara la frontera técnica.</h2></div><p>Valores nominales de fabricante y economía recalculada con el mismo snapshot. Tolerancias, temperatura, tensión y lote pueden cambiar el resultado real.</p></div><div class="kf-table-scroll"><table class="kf-mining-table kf-mining-hardware-table"><thead><tr><th>Fabricante / equipo</th><th>Refrigeración</th><th class="number">Hashrate</th><th class="number">Potencia</th><th class="number">Eficiencia</th><th>Condiciones</th><th class="number">Ingreso / día</th><th class="number">Equilibrio</th><th>Fuente</th></tr></thead><tbody data-mining-hardware-table><tr><td colspan="9">Cargando equipos y economía…</td></tr></tbody></table></div><p class="kf-mining-table-note">La comparación utiliza exclusivamente la economía de Bitcoin. No mezcla BCH, BSV ni rentabilidades de otros algoritmos.</p></div></section>'
      +'<section class="kf-section kf-mining-pools-section" id="pools-mineros"><div class="kf-container"><div class="kf-mining-section-head"><div><p class="kf-kicker">Bloques observados y condiciones de pago</p><h2>Cuota no equivale a rendimiento neto.</h2></div><p>La distribución muestra bloques atribuidos durante siete días. La tabla económica separa método de recompensa, comisión, mínimo y frecuencia cuando existe una fuente pública.</p></div><div class="kf-mining-pool-layout"><section data-mining-pool-chart><div class="kf-live-empty">Cargando distribución…</div></section><section class="kf-mining-pool-table" data-mining-pool-table><div class="kf-live-empty">Cargando condiciones…</div></section></div></div></section>'
      +'<section class="kf-section kf-mining-countries" id="paises-mineros"><div class="kf-container"><div class="kf-mining-section-head"><div><p class="kf-kicker">Coste eléctrico oficial · 37 países</p><h2>Tarifa industrial y resultado diario.</h2></div><p>Benchmark semestral no doméstico de Eurostat. Permite comparar el mismo S21 XP; no sustituye una oferta de hosting o PPA.</p></div><div class="kf-mining-country-context" data-mining-country-context><span>Conectando Eurostat y BCE…</span></div><div class="kf-mining-country-tools"><label>Buscar país<input type="search" data-mining-country-search placeholder="Ej. Finlandia"></label><label>Resultado del S21 XP<select data-mining-country-profit><option value="all">Todos</option><option value="positive">Solo margen positivo</option><option value="negative">Solo margen negativo</option></select></label><span data-mining-country-count>—</span></div><div class="kf-table-scroll"><table class="kf-mining-country-table"><thead><tr><th>País</th><th>Periodo</th><th class="number">EUR/kWh</th><th class="number">US$/kWh</th><th class="number">S21 XP / día</th><th>Comprobación pendiente</th></tr></thead><tbody data-mining-countries><tr><td colspan="6">Esperando comparación internacional…</td></tr></tbody></table></div><button class="kf-list-expand kf-list-expand-on-dark" type="button" data-mining-country-expand aria-expanded="false">Ver los 37 países</button><div class="kf-mining-country-caveat"><strong>No decide una localización</strong><span>Antes de contratar deben comprobarse PPA o tarifa de hosting, MW disponibles, firmeza y curtailment, conexión, permisos, fiscalidad, importación, clima, telecomunicaciones y contraparte.</span></div></div></section>'
      +'<section class="kf-section kf-mining-method-section"><div class="kf-container"><details class="kf-mining-method-full"><summary>Metodología, frecuencia y límites</summary><div><p><strong>Precio:</strong> Kaufman Reference Price, objetivo 5 minutos. Recalcula ingresos cuando recibe una referencia BTC/USD más reciente.</p><p><strong>Red y pools:</strong> mempool.space, objetivo 30 minutos mediante una automatización independiente. Recompensa media de 144 bloques y pools de 7 días.</p><p><strong>Hardware:</strong> especificaciones primarias de BITMAIN, MicroBT y Canaan. Los valores son nominales; prevalece la ficha del lote comprado.</p><p><strong>Referencia inicial de energía:</strong> 0,0555 US$/kWh, equivalente a la mediana all-in de 55,5 US$/MWh publicada en el Cambridge Digital Mining Industry Report 2025. Es un benchmark editable, no una oferta ni la tarifa de un país. <a href="https://www.jbs.cam.ac.uk/faculty-research/centres/alternative-finance/publications/cambridge-digital-mining-industry-report/" target="_blank" rel="noopener noreferrer">Abrir fuente ↗</a></p><p><strong>Electricidad internacional:</strong> Eurostat nrg_pc_205, banda no doméstica de 500–1.999 MWh/año con impuestos y gravámenes; conversión BCE. La fuente es semestral aunque se compruebe automáticamente.</p></div></details></div></section>'
    +'</main>';
  }

  function renderMining(){
    const heroImage=assetUrl('/assets/images/mining-operations-hero-v1.jpg');
    return `<main class="kf-main kf-mining-page" id="main-content"><header class="kf-mining-hero"><div class="kf-container"><div class="kf-breadcrumbs"><a href="/">Inicio</a><span>/</span><span>Minería</span></div><div class="kf-mining-hero-frame"><div class="kf-mining-hero-copy"><div class="kf-mining-hero-topline"><p class="kf-kicker">Bitcoin · operación minera</p><span class="kf-mining-live"><i aria-hidden="true"></i>Datos conectados</span></div><h1>Minería</h1><p class="kf-mining-hero-deck">Lo que la red paga, lo que el equipo consume y el coste eléctrico que separa margen de pérdida.</p><dl class="kf-mining-hero-scope"><div><dt>Estado de red</dt><dd data-mining-hero-observed>Sincronizando snapshot…</dd></div><div><dt>Cobertura</dt><dd>Red · rentabilidad · ASIC · pools · países</dd></div></dl><nav aria-label="Contenido de minería"><a href="#red-minera">Red</a><a href="#economia-minera">Rentabilidad</a><a href="#equipos-mineros">Equipos</a><a href="#pools-mineros">Pools</a><a href="#paises-mineros">Países</a></nav></div><figure><div class="kf-mining-hero-media"><img src="${heroImage}" width="1672" height="941" alt="Técnico inspeccionando filas de equipos ASIC en una instalación profesional de minería de criptoactivos" fetchpriority="high"><span>ASIC · SHA-256</span></div><figcaption><strong>Infraestructura de cómputo</strong><span>Potencia · refrigeración · disponibilidad</span></figcaption></figure></div></div></header>
      <section class="kf-section kf-mining-network" id="red-minera" data-mining-dashboard><div class="kf-container"><div class="kf-mining-section-head"><div><p class="kf-kicker">Bitcoin · estado de red</p><h2>Qué está pagando la red ahora.</h2></div><p data-mining-observed>Conectando snapshot minero…</p></div><div class="kf-mining-kpis-main"><article><span>Hashprice</span><strong data-mining-kpi="hashprice">—</strong><small>USD por PH/s y día</small></article><article><span>Hashrate de red</span><strong data-mining-kpi="hashrate">—</strong><small data-mining-kpi-note="hashrate">Promedio observado</small></article><article><span>Próximo ajuste</span><strong data-mining-kpi="difficulty">—</strong><small data-mining-kpi-note="difficulty">Estimación de dificultad</small></article><article><span>Comisiones / recompensa</span><strong data-mining-kpi="fee-share">—</strong><small>Últimos 144 bloques</small></article><article><span>Intervalo de bloque</span><strong data-mining-kpi="block-time">—</strong><small>Promedio del periodo</small></article><article><span>Electricidad de equilibrio</span><strong data-mining-kpi="break-even">—</strong><small>Antminer S21 XP · antes de otros costes</small></article></div><div class="kf-mining-network-grid"><section class="kf-mining-chart-panel"><header><div><span>Hashrate medio diario</span><strong data-mining-chart-summary>—</strong></div><div class="kf-range-switch" role="group" aria-label="Periodo del gráfico de hashrate"><button type="button" data-mining-range="7" aria-pressed="false">7 días</button><button type="button" data-mining-range="30" aria-pressed="true">30 días</button><button type="button" data-mining-range="90" aria-pressed="false">90 días</button></div></header><div class="kf-mining-chart" data-mining-hashrate-chart><div class="kf-live-empty">Esperando serie de red…</div></div><footer><span>EH/s · media diaria</span><a href="https://mempool.space/docs/api/rest" target="_blank" rel="noopener noreferrer">Fuente y endpoint ↗</a></footer></section><aside class="kf-mining-decisions" data-mining-decisions><div class="kf-live-empty">Calculando señales…</div></aside></div></div></section>
      <section class="kf-section kf-mining-economics" id="economia-minera"><div class="kf-container"><div class="kf-mining-section-head"><div><p class="kf-kicker">Economía por equipo</p><h2>Introduce tu coste real.</h2></div><p>Un precio nacional no sustituye tu factura. Esta simulación separa ingreso de red, consumo, refrigeración, pool y disponibilidad.</p></div>${miningCalculatorMarkup()}</div></section>
      <section class="kf-section kf-mining-equipment" id="equipos-mineros"><div class="kf-container"><div class="kf-mining-section-head"><div><p class="kf-kicker">Hardware SHA-256</p><h2>Misma red, distinta frontera eléctrica.</h2></div><p>Especificación típica del fabricante y resultado recalculado con el mismo snapshot para que la eficiencia sea comparable.</p></div><div class="kf-table-scroll"><table class="kf-mining-table"><thead><tr><th>Equipo</th><th>Refrigeración</th><th class="number">Hashrate</th><th class="number">Potencia</th><th class="number">Eficiencia</th><th class="number">Ingreso bruto / día</th><th class="number">Equilibrio eléctrico</th><th>Fuente</th></tr></thead><tbody data-mining-hardware-table><tr><td colspan="8">Cargando equipos y economía…</td></tr></tbody></table></div><p class="kf-mining-table-note">BTC, BCH y BSV comparten SHA-256, pero esta economía utiliza exclusivamente recompensa, dificultad y precio de Bitcoin. No mezcla rentabilidades de monedas distintas.</p></div></section>
      <section class="kf-section kf-mining-pools-section" id="pools-mineros"><div class="kf-container"><div class="kf-mining-section-head"><div><p class="kf-kicker">Producción observada · 7 días</p><h2>Quién ha encontrado los bloques.</h2></div><p>La cuota se calcula sobre bloques atribuidos públicamente. Identidad del pool no equivale a ubicación física del hashrate.</p></div><div class="kf-mining-pool-layout"><section data-mining-pool-chart><div class="kf-live-empty">Cargando distribución…</div></section><section class="kf-mining-pool-table" data-mining-pool-table><div class="kf-live-empty">Cargando pools…</div></section></div></div></section>
      <section class="kf-section kf-mining-countries" id="paises-mineros"><div class="kf-container"><div class="kf-mining-section-head"><div><p class="kf-kicker">Coste eléctrico comparable</p><h2>Tres países a estudiar primero hoy.</h2></div><p>No es un ranking político ni una recomendación de localización. Ordena la cobertura pública disponible por precio eléctrico y muestra el resultado del mismo S21 XP.</p></div><div class="kf-mining-country-context" data-mining-country-context><span>Conectando Eurostat y BCE…</span></div><div class="kf-mining-country-grid" data-mining-countries><div class="kf-live-empty">Esperando comparación internacional…</div></div><div class="kf-mining-country-caveat"><strong>Qué falta antes de elegir país</strong><span>PPA o tarifa contractual, capacidad firme, permisos, impuestos, importación, refrigeración, telecomunicaciones, repatriación de capital y riesgo de contraparte.</span></div></div></section>
      <section class="kf-section kf-mining-method-section"><div class="kf-container"><details class="kf-mining-method-full"><summary>Metodología, frecuencia y límites</summary><div><p><strong>Red y pools:</strong> mempool.space. Recompensa media de 144 bloques, ritmo de bloque observado y distribución de pools de 7 días.</p><p><strong>Precio:</strong> Kaufman Reference Price; la página recalcula la economía cuando recibe una referencia BTC/USD más reciente.</p><p><strong>Hardware:</strong> especificaciones típicas publicadas por BITMAIN. Tolerancias reales, temperatura, firmware y lote pueden alterar potencia y hashrate.</p><p><strong>Países:</strong> Eurostat nrg_pc_205, banda no doméstica de 500–1.999 MWh/año con impuestos y gravámenes incluidos; conversión EUR/USD del BCE. El proceso automático consulta la fuente cada día y cambia la lista cuando aparece un periodo nuevo.</p></div></details></div></section></main>`;
  }

  function renderDirectory(type){
    const catalog=CATALOGS[type];
    if(!catalog)return renderNotFound();
    if(type==='mineria')return renderMiningV2();
    if(type==='regulacion')return renderRegulationV2();
    if(type==='wallets')return `<main class="kf-main" id="main-content">${walletHeroMarkup()}<section class="kf-section kf-wallet-page"><div class="kf-container">${walletIntelligenceMarkup()}</div></section></main>`;
    const hasVerified=catalog.items.some((item)=>item.status==='verified');
    if(type==='bancos')return `<main class="kf-main" id="main-content"><header class="kf-bank-page-head"><div class="kf-container"><div><p class="kf-kicker">Banca global · tokenización</p><h1>Bancos</h1></div><p>Top 25 mundial por activos y productos blockchain contrastados: dinero programable, valores tokenizados, custodia e infraestructura de liquidación.</p></div></header><section class="kf-section kf-bank-data-section"><div class="kf-container">${bankRegistryMarkup()}</div></section></main>`;
    const connected=type==='exchanges'?exchangeFeesMarkup():'';
    const special=type==='wallets'?walletIntelligenceMarkup():type==='proyectos'?web3ArchitectureMarkup():'';
    const availableStates=[...new Set(catalog.items.map((item)=>item.status))];
    const statusOptions=`<option value="all">Todos los estados</option>${availableStates.map((state)=>`<option value="${state}">${STATUS_LABELS[state]||state}</option>`).join('')}`;
    const heroTone=hasVerified?'verified':'auto';
    return `<main class="kf-main" id="main-content">${pageHero(catalog.label,catalog.description,'Directorio con fuentes',heroTone)}<section class="kf-section" id="directorio"><div class="kf-container">${special}${connected}${dataNoteMarkup(hasVerified)}<div class="kf-toolbar"><div class="kf-search-field"><input type="search" data-directory-search placeholder="Buscar en ${catalog.label.toLowerCase()}…" aria-label="Buscar en ${catalog.label}"></div><select class="kf-select" data-status-filter aria-label="Filtrar por estado">${statusOptions}</select><span class="kf-result-count" data-result-count>${catalog.items.length} fichas</span></div><div class="kf-record-grid" data-record-grid>${catalog.items.map((item,index)=>recordCard(type,item,index)).join('')}<div class="kf-empty" data-empty hidden>No hay fichas que coincidan con el filtro.</div></div></div></section></main>`;
  }

  function l2IntelligenceMarkup(){
    const kpis=[['total_l2_tvs_usd','Valor asegurado en L2'],['stage_1_or_2_projects','Proyectos con madurez 1 o 2'],['projects_without_emergency_exit_window','Sin salida ante upgrade urgente'],['curated_public_rwa_usd','RWA público en el radar']];
    return `<section class="kf-l2-intelligence"><div class="kf-l2-lead"><div><p class="kf-kicker">Infraestructura L2 · explicada en español</p><h2 class="kf-title small">Lo importante está debajo del ticker.</h2></div><div><p>Madurez, stack, disponibilidad de datos, ventana de salida y quién puede mantener el sistema vivo si falla un operador. Kaufman conserva el dato original de L2BEAT y traduce su significado.</p><span data-l2-status>Conectando L2BEAT…</span><nav class="kf-l2-context-nav"><a href="/proyectos/">Ver el stack Web3 →</a></nav></div></div><div class="kf-l2-kpis">${kpis.map(([key,label])=>`<article><span>${label}</span><strong data-l2-kpi="${key}">—</strong></article>`).join('')}</div><div class="kf-l2-glossary"><div><strong>Madurez ≠ seguridad</strong><span>El nivel mide madurez y descentralización según el marco L2BEAT.</span></div><div><strong>TVS ≠ volumen</strong><span>Total Value Secured es valor asegurado por el sistema.</span></div><div><strong>DA</strong><span>Dónde se publican los datos necesarios para reconstruir y verificar el estado.</span></div></div><div class="kf-l2-projects" data-l2-projects><div class="kf-live-empty">Esperando proyectos L2…</div></div><div class="kf-rwa-method kf-l2-method"><div><span>COBERTURA</span><strong data-l2-coverage>—</strong></div><div><span>SELECCIÓN</span><strong>Muestra editorial declarada · no es un ranking</strong></div><div><span>FUENTE</span><a href="https://l2beat.com/scaling/summary" target="_blank" rel="noopener noreferrer">L2BEAT ↗</a></div><p data-l2-methodology>El nivel de madurez no sustituye una auditoría de seguridad. Ante discrepancia prevalece la ficha original.</p></div></section>`;
  }

  function renderMarkets(){
    const rows=[['bitcoin','BTC','Bitcoin'],['ethereum','ETH','Ethereum']];
    const rwaKpis=[
      ['tracked_rwa_tvl_usd','Capital RWA onchain','Protocolos de activos reales, sin stablecoins'],
      ['treasury_bills_tvl_usd','Deuda soberana tokenizada','Exposición etiquetada como Treasury Bills'],
      ['rwa_lending_tvl_usd','Financiación RWA','TVL en protocolos de préstamo RWA'],
      ['usd_stablecoin_value_usd','Rail monetario tokenizado','Stablecoins USD valoradas sin asumir paridad']
    ];
    return `<main class="kf-main" id="main-content">${pageHero('Mercados','La infraestructura financiera que ya se está moviendo onchain: deuda pública, fondos, crédito, materias primas, acciones y redes de liquidación. El precio cripto es contexto, no el producto.','Capital tokenizado mundial','auto')}<section class="kf-section kf-rwa-market"><div class="kf-container"><div class="kf-rwa-lead"><div><p class="kf-kicker">Mercado que no aparece en un ticker</p><h2 class="kf-title">El nuevo mapa del capital.</h2></div><div><p>Medimos capital rastreado en productos RWA, su concentración y por qué redes circula. Las cifras llegan server-side desde adaptadores públicos; ninguna fila se completa a mano.</p><span class="kf-rwa-observed" data-tokenization-status>Conectando fuente pública…</span></div></div><div class="kf-rwa-kpis">${rwaKpis.map(([key,label,note],index)=>`<article class="kf-rwa-kpi"><span>0${index+1} · ${label}</span><strong data-token-kpi="${key}">—</strong><small>${note}</small></article>`).join('')}</div><div class="kf-rwa-ratios"><article><span>RWA / stablecoins USD</span><strong data-token-ratio="tracked_rwa_to_stablecoin_pct">—</strong><small>Escala del capital RWA frente al rail de liquidación</small></article><article><span>Concentración top 5</span><strong data-token-ratio="top_5_concentration_pct">—</strong><small>Cuánto controlan los cinco mayores productos</small></article><article><span>Capital multichain</span><strong data-token-ratio="multichain_tvl_share_pct">—</strong><small>TVL de productos desplegados en más de una red</small></article><article><span>Variación stablecoins 24 h</span><strong data-token-ratio="stablecoin_supply_change_24h_pct">—</strong><small>Cambio de circulación valorada, no del precio del token</small></article></div><div class="kf-rwa-layout"><section class="kf-rwa-panel"><div class="kf-rwa-panel-head"><div><p class="kf-kicker">Clases de activo</p><h3>Dónde entra el capital.</h3></div><small>No sumar: una iniciativa puede tener varias etiquetas</small></div><div class="kf-rwa-bars" data-token-segments><div class="kf-live-empty">Esperando clases de activo…</div></div></section><section class="kf-rwa-panel"><div class="kf-rwa-panel-head"><div><p class="kf-kicker">Infraestructura</p><h3>Por qué redes circula.</h3></div><small>Distribución de chainTvls del universo RWA</small></div><div class="kf-rwa-bars" data-token-networks><div class="kf-live-empty">Esperando redes…</div></div></section></div><div class="kf-section-head kf-rwa-subhead"><div><p class="kf-kicker">Concentración del mercado</p><h2 class="kf-title small">Los productos que ya pesan.</h2></div><p class="kf-intro">No ordenamos monedas: ordenamos vehículos y protocolos por capital onchain rastreado, con clase de activo, redes y adaptador auditable.</p></div><div class="kf-data-table-wrap"><table class="kf-data-table kf-rwa-leaders"><thead><tr><th>Producto / protocolo</th><th>Clase</th><th class="number">Capital onchain</th><th>Redes</th><th class="number">7 días</th><th>Evidencia</th></tr></thead><tbody data-token-leaders><tr><td colspan="6">Esperando universo RWA…</td></tr></tbody></table></div><div class="kf-rwa-settlement"><div><p class="kf-kicker">Rail de liquidación</p><h3>Dónde vive el dólar tokenizado.</h3><p>Distribución del valor circulante de stablecoins USD por red. Se multiplica oferta por precio observado: nunca se presupone automáticamente 1 USD.</p></div><div class="kf-rwa-bars compact" data-token-stablecoin-networks><div class="kf-live-empty">Esperando distribución…</div></div></div><div class="kf-rwa-method"><div><span>UNIVERSO</span><strong data-token-coverage>—</strong></div><div><span>MÉTODO</span><strong>TVL RWA elegible · etiquetas solapables · chainTvls por red</strong></div><div><span>FUENTE</span><a href="https://defillama.com/docs/api" target="_blank" rel="noopener noreferrer">DefiLlama Open API ↗</a></div><p data-token-methodology>Los endpoints no publican timestamp por fila. Kaufman registra la recepción y bloquea el panel si supera 24 horas.</p></div>${l2IntelligenceMarkup()}</div></section>${marketSignalsMarkup()}${marketBandMarkup()}<section class="kf-section"><div class="kf-container"><div class="kf-section-head"><div><p class="kf-kicker">Contexto de mercado</p><h2 class="kf-title small">Precio, fuentes y método.</h2></div><p class="kf-intro">La antena de BTC, ETH y SOL queda como capa auxiliar. Si la publicación automática supera quince minutos, Kaufman muestra “No disponible”.</p></div><div class="kf-antenna-contract"><div><span>Publicación</span><strong>Cálculo automático · objetivo 5 min</strong></div><div><span>Agregación</span><strong>Mediana de mercados elegibles</strong></div><div><span>Stablecoins</span><strong>USDT y USDC convertidos, sin paridad asumida</strong></div><div><span>Entrega</span><strong>Backend Kaufman · navegador sin APIs externas</strong></div></div><div class="kf-data-table-wrap"><table class="kf-data-table kf-reference-table"><thead><tr><th>Activo</th><th class="number">Precio USD</th><th>Actualización</th><th>Fuentes utilizadas</th><th>Confianza</th><th class="number">Divergencia máx.</th></tr></thead><tbody>${rows.map(([id,symbol,name])=>`<tr data-market-asset="${id}"><td><strong>${symbol}</strong> · ${name}</td><td class="number kf-market-price">—</td><td class="kf-market-change na" data-market-age>No disponible</td><td data-market-venues>Sin fuentes frescas</td><td data-market-confidence>—</td><td class="number" data-market-divergence>—</td></tr>`).join('')}</tbody></table></div><div class="kf-method-strip"><strong>Kaufman Reference Price v1</strong><span data-market-methodology>Mediana server-side · objetivo 5 min · volumen mínimo · divergencia máxima 2,5 % · hora visible.</span></div><div class="kf-section-head kf-spaced-head"><div><p class="kf-kicker">Conversión estable</p><h2 class="kf-title small">USD, USDT y USDC no son sinónimos.</h2></div><p class="kf-intro">Las parejas de Binance y DEX solo entran cuando existe un tipo USDT/USD o USDC/USD fresco observado en otro mercado.</p></div><div class="kf-stable-grid" data-stablecoin-grid><div class="kf-live-empty">Esperando tipos de conversión…</div></div><div class="kf-section-head kf-spaced-head"><div><p class="kf-kicker">Fuentes de mercado</p><h2 class="kf-title small">Mercados utilizados en el precio.</h2></div><p class="kf-intro">Solo intervienen mercados frescos, con volumen suficiente y dentro del umbral de divergencia.</p></div><div class="kf-provider-grid" data-provider-grid><div class="kf-live-empty">Actualizando fuentes server-side…</div></div><div class="kf-section-head kf-spaced-head"><div><p class="kf-kicker">Mercados descentralizados</p><h2 class="kf-title small">Tokens identificados por red y contrato.</h2></div><p class="kf-intro">DEX Screener aporta pools públicos. Kaufman verifica identidad, pool y última operación onchain antes de publicarlos; no los incorpora silenciosamente al precio de referencia.</p></div><div class="kf-data-table-wrap"><table class="kf-data-table kf-dex-table"><thead><tr><th>Token onchain</th><th>Pool</th><th class="number">Precio</th><th class="number">Volumen 24 h</th><th class="number">Liquidez</th><th>Estado</th></tr></thead><tbody data-dex-pools><tr><td colspan="6">Esperando DEX Screener…</td></tr></tbody></table></div><div class="kf-section-head kf-spaced-head"><div><p class="kf-kicker">Metadatos</p><h2 class="kf-title small">CoinGecko, fuera del ticker.</h2></div><p class="kf-intro">Solo IDs, imágenes, categorías, capitalización y oferta circulante. Cada registro exige un last_updated_at válido.</p></div><div class="kf-metadata-grid" data-market-metadata><div class="kf-live-empty">Metadatos en segundo plano…</div></div></div></section></main>`;
  }

  function renderTokenization(){
    const kpis=[
      ['tracked_rwa_tvl_usd','Capital RWA rastreado','Productos y protocolos clasificados como RWA'],
      ['treasury_bills_tvl_usd','Deuda soberana tokenizada','Etiqueta Treasury Bills; no confundir con deuda total emitida'],
      ['rwa_lending_tvl_usd','Financiación RWA','Protocolos clasificados como RWA Lending'],
      ['usd_stablecoin_value_usd','Rail monetario tokenizado','Circulación USD valorada sin asumir paridad']
    ];
    const questions=[['concentracion','¿Dónde se concentra el capital?'],['redes','¿Qué redes dominan?'],['movimiento','¿Qué está cambiando?'],['calidad','¿Qué datos no son fiables?'],['stablecoins','¿Qué papel tienen las stablecoins?']];
    return `<main class="kf-main" id="main-content">${pageHero('Tokenización','Capital, productos, clases de activo y redes que ya operan onchain. Kaufman separa hechos observados, límites de cobertura y señales calculadas.','Inteligencia de activos tokenizados','auto')}
      <section class="kf-section kf-tokenization-live" data-tokenization-dashboard><div class="kf-container">
        <div class="kf-token-lead"><div><p class="kf-kicker">Tokenización mundial</p><h2 class="kf-title">Indicadores globales de activos tokenizados.</h2></div><div><p>Capital onchain rastreado, composición por clase de activo, concentración, redes utilizadas y calidad de las fuentes.</p><span data-tokenization-status>Conectando fuentes públicas…</span></div></div>
        <div class="kf-rwa-kpis kf-token-kpis">${kpis.map(([key,label,note],index)=>`<article class="kf-rwa-kpi"><span>0${index+1} · ${label}</span><strong data-token-kpi="${key}">—</strong><small>${note}</small></article>`).join('')}</div>
        <div class="kf-token-signal-strip"><article><span>Concentración top 5</span><strong data-token-ratio="top_5_concentration_pct">—</strong><small>Cuota del capital rastreado</small></article><article><span>Capital multichain</span><strong data-token-ratio="multichain_tvl_share_pct">—</strong><small>Productos desplegados en más de una red</small></article><article><span>Cobertura por red</span><strong data-token-ratio="network_allocation_coverage_pct">—</strong><small>TVL reconciliado con desglose chainTvls</small></article><article><span>Stablecoins / RWA</span><strong data-token-multiple>—</strong><small>Escala del rail USD frente al capital RWA</small></article></div>

        <section class="kf-token-analyst"><div class="kf-token-analyst-copy"><p class="kf-kicker">Análisis del snapshot</p><h2>Consulta los indicadores disponibles.</h2><p>Las respuestas se calculan únicamente con los datos publicados en esta página e indican las magnitudes y limitaciones utilizadas.</p><div class="kf-token-question-list">${questions.map(([value,label])=>`<button type="button" data-token-question="${value}">${label}</button>`).join('')}</div></div><div class="kf-token-analyst-console"><form data-token-analyst-form><label for="token-question">Consulta sobre activos tokenizados</label><div><input id="token-question" data-token-analyst-input placeholder="Ej. ¿qué producto registra la mayor variación semanal?"><button type="submit">Analizar →</button></div></form><div class="kf-token-answer" data-token-answer><span>RESULTADO</span><strong>Selecciona una consulta o escribe una pregunta.</strong><p>La respuesta mostrará el cálculo y los límites del dato.</p></div><small data-token-engine-policy>Cálculo determinista y trazable · sin proveedor externo</small></div></section>

        <div class="kf-rwa-layout kf-token-breakdowns"><section class="kf-rwa-panel"><div class="kf-rwa-panel-head"><div><p class="kf-kicker">Clases de activo</p><h3>Capital por clase de activo</h3></div><small>Etiquetas solapables; no deben sumarse</small></div><div class="kf-rwa-bars" data-token-segments><div class="kf-live-empty">Esperando clases de activo…</div></div></section><section class="kf-rwa-panel"><div class="kf-rwa-panel-head"><div><p class="kf-kicker">Redes</p><h3>Capital por red</h3></div><small>Asignación normalizada al TVL de cada producto</small></div><div class="kf-rwa-bars" data-token-networks><div class="kf-live-empty">Esperando redes…</div></div></section></div>

        <div class="kf-section-head kf-token-section-head"><div><p class="kf-kicker">Variación a 7 días</p><h2 class="kf-title small">Productos con mayor variación semanal.</h2></div><p class="kf-intro">Incluye productos con al menos 10 M USD rastreados. La variación procede del agregador y no representa rentabilidad para el inversor.</p></div><div class="kf-token-movers"><section><header><span>Variación positiva</span><strong>Mayores subidas 7 d</strong></header><div data-token-gainers><div class="kf-live-empty">Esperando datos…</div></div></section><section><header><span>Variación negativa</span><strong>Mayores bajadas 7 d</strong></header><div data-token-decliners><div class="kf-live-empty">Esperando datos…</div></div></section></div>

        <div class="kf-section-head kf-token-section-head"><div><p class="kf-kicker">Productos rastreados</p><h2 class="kf-title small">Directorio de productos tokenizados.</h2></div><p class="kf-intro">Consulta y filtra los productos observados por clase, red, capital rastreado y variación semanal. Cada registro conserva su fuente y adaptador.</p></div><div class="kf-token-product-controls"><div class="kf-search-field"><input type="search" data-token-product-search placeholder="Buscar producto…" aria-label="Buscar producto tokenizado"></div><select class="kf-select" data-token-segment-filter aria-label="Filtrar clase"><option value="all">Todas las clases</option></select><select class="kf-select" data-token-network-filter aria-label="Filtrar red"><option value="all">Todas las redes</option></select><select class="kf-select" data-token-product-sort aria-label="Ordenar productos"><option value="value-desc">Mayor capital</option><option value="change-desc">Mayor subida 7 d</option><option value="change-asc">Mayor bajada 7 d</option><option value="name">Nombre A–Z</option></select><span data-token-product-count>Esperando productos…</span></div><div class="kf-data-table-wrap"><table class="kf-data-table kf-token-products-table"><thead><tr><th>Producto</th><th>Clase</th><th class="number">Capital</th><th class="number">Cuota</th><th class="number">7 días</th><th>Redes</th><th>Evidencia</th></tr></thead><tbody data-token-products><tr><td colspan="7">Esperando productos…</td></tr></tbody></table></div><div class="kf-token-product-more"><button type="button" data-token-product-expand hidden>Ver todos los productos</button></div>

        <div class="kf-section-head kf-token-section-head"><div><p class="kf-kicker">Redes L2</p><h2 class="kf-title small">Capital RWA público en redes L2.</h2></div><p class="kf-intro">L2BEAT aporta etapa y confianza adicional. Sus cifras se muestran por separado porque su definición y cobertura difieren de DefiLlama.</p></div><div class="kf-data-table-wrap"><table class="kf-data-table"><thead><tr><th>Red L2</th><th>Etapa</th><th class="number">RWA público</th><th class="number">% del TVS</th><th class="number">Confianza adicional</th><th>Datos</th><th>Fuente</th></tr></thead><tbody data-token-l2-rows><tr><td colspan="7">Esperando datos de L2BEAT…</td></tr></tbody></table></div>

        <div class="kf-section-head kf-token-section-head"><div><p class="kf-kicker">Cobertura y calidad</p><h2 class="kf-title small">Calidad y límites de los datos.</h2></div><p class="kf-intro">Se muestran la cobertura, los enlaces disponibles, la asignación por red y los campos que la fuente no publica.</p></div><div class="kf-token-quality-grid"><article><span>Registros publicados</span><strong data-token-quality="publication_rate_pct">—</strong><small data-token-quality-detail="published">—</small></article><article><span>Enlace de proyecto</span><strong data-token-quality="project_link_coverage_pct">—</strong><small>Cobertura de evidencia institucional</small></article><article><span>Adaptador auditable</span><strong data-token-quality="adapter_link_coverage_pct">—</strong><small>Código de cálculo accesible</small></article><article><span>Asignación por red</span><strong data-token-quality="network_allocation_coverage_pct">—</strong><small>Parte del TVL que reconcilia por red</small></article><article><span>Desgloses corregidos</span><strong data-token-quality="raw_chain_breakdown_mismatch_records">—</strong><small>Desviación bruta &gt; 2 %, normalizada</small></article><article><span>Timestamp por producto</span><strong>No publicado</strong><small>Se usa hora de recepción; bloqueo a las 24 h</small></article></div>

        <section class="kf-token-source-reality"><div><p class="kf-kicker">Fuentes y cobertura</p><h2>Fuentes conectadas y no conectadas.</h2><p>DefiLlama aporta productos, TVL, etiquetas y redes. L2BEAT aporta información de infraestructura L2. RWA.xyz no está conectada porque requiere clave y acceso específico.</p><p class="kf-token-license-note">La reutilización comercial de datos públicos está sujeta a atribución y a los <a href="https://defillama.com/terms" target="_blank" rel="noopener noreferrer">términos del proveedor ↗</a>.</p></div><div class="kf-token-source-stack"><article><i data-token-source-health="defillama_tokenization"></i><div><strong>DefiLlama Open API</strong><span>Capital, clases, redes, stablecoins y adaptadores</span></div><a href="https://defillama.com/docs/api" target="_blank" rel="noopener noreferrer">Fuente ↗</a></article><article><i data-token-source-health="l2beat_projects"></i><div><strong>L2BEAT Public API</strong><span>RWA público, etapa y confianza de infraestructura L2</span></div><a href="https://l2beat.com/scaling/tvs" target="_blank" rel="noopener noreferrer">Fuente ↗</a></article><article class="blocked"><i></i><div><strong>RWA.xyz API</strong><span>No conectada · requiere clave y acceso a API Tools</span></div><a href="https://docs.rwa.xyz/api/getting-started" target="_blank" rel="noopener noreferrer">Requisito ↗</a></article></div></section>

        <div class="kf-rwa-settlement kf-token-settlement"><div><p class="kf-kicker">Stablecoins USD</p><h3>Distribución por red.</h3><p>La oferta se multiplica por el precio observado; no se presupone automáticamente una paridad de 1 USD.</p></div><div class="kf-rwa-bars compact" data-token-stablecoin-networks><div class="kf-live-empty">Esperando distribución…</div></div></div>
        <div class="kf-rwa-method kf-token-method"><div><span>COBERTURA</span><strong data-token-coverage>—</strong></div><div><span>IDENTIFICACIÓN</span><strong>Producto por slug · red normalizada · recepción horaria</strong></div><div><span>VERIFICACIÓN</span><strong>Observado en agregador · no verificación del emisor</strong></div><p data-token-methodology>Los endpoints no publican timestamp por producto. Kaufman registra la recepción y bloquea el panel si supera 24 horas.</p></div>
      </div></section></main>`;
  }

  function renderFiscal(){
    return `<main class="kf-main" id="main-content">${pageHero('Fiscal','Fiscalidad blockchain comparada por hecho económico, residencia y tipo de actividad. Kaufman muestra la regla, la fuente y el punto exacto donde deja de poder concluir.','Inteligencia fiscal comparada','auto')}
      <section class="kf-section kf-fiscal-live" data-fiscal-dashboard><div class="kf-container">
        <section class="kf-fiscal-editorial"><figure><img src="/assets/images/fiscal-review-v1.jpg" width="1536" height="1024" alt="Profesional revisando documentación fiscal y registros de operaciones digitales" loading="eager"><figcaption><span>Revisión documental</span><strong>Operación, fecha, coste y residencia</strong></figcaption></figure><div class="kf-fiscal-editorial-copy"><p class="kf-kicker">Fiscalidad blockchain · jurisdicción × evento</p><h2>Qué datos determinan el tratamiento fiscal.</h2><p>Vender, permutar, recibir recompensas, minar o mantener activos puede producir obligaciones distintas. El cálculo separa el hecho, la categoría, el momento, el reporte y el límite de cada fuente.</p><ol><li><span>01</span><div><strong>Residencia fiscal efectiva</strong><small>País aplicable y situación personal o empresarial.</small></div></li><li><span>02</span><div><strong>Operación y fecha</strong><small>Venta, permuta, staking, minería o tenencia.</small></div></li><li><span>03</span><div><strong>Valor de salida y coste</strong><small>Importes en la moneda exigida por la jurisdicción.</small></div></li><li><span>04</span><div><strong>Perfil y custodia</strong><small>Inversión personal, actividad, sociedad y proveedor.</small></div></li></ol><span data-fiscal-status>Conectando registro fiscal server-side…</span></div></section>
        <div class="kf-fiscal-kpis"><article><span>Jurisdicciones</span><strong data-fiscal-kpi="jurisdiction_count">—</strong><small>Mismo contrato comparativo</small></article><article><span>Hechos fiscales</span><strong data-fiscal-kpi="fact_count">—</strong><small>Cinco eventos por jurisdicción</small></article><article><span>Hechos resueltos</span><strong data-fiscal-kpi="resolved_fact_pct">—</strong><small>El resto se bloquea, no se rellena</small></article><article><span>Fuentes oficiales</span><strong data-fiscal-kpi="source_count">—</strong><small>Leyes, doctrina, guías y formularios</small></article><article><span>Última revisión jurídica</span><strong data-fiscal-reviewed>—</strong><small>Accesibilidad ≠ vigencia material</small></article></div>

        <section class="kf-fiscal-engine"><div class="kf-fiscal-engine-copy"><div><p class="kf-kicker">Cálculo por operación</p><h2>Introduce los datos de tu operación.</h2><p>Los tramos y umbrales se aplican a los importes declarados. El resultado muestra cálculo, método, fuentes, supuestos y límites.</p></div><div class="kf-fiscal-safety"><span>NO CALCULA</span><strong>Residencia efectiva · cuota tributaria final · convenios · impuestos regionales · estructura societaria</strong></div></div><form class="kf-fiscal-controls" data-fiscal-scenario-form><div class="kf-field"><label for="fiscal-jurisdiction">Jurisdicción fiscal</label><select class="kf-select" id="fiscal-jurisdiction" data-fiscal-jurisdiction><option value="">Esperando datos…</option></select></div><div class="kf-field"><label for="fiscal-event">Evento</label><select class="kf-select" id="fiscal-event" data-fiscal-event><option value="sell_fiat">Venta a moneda fiat</option><option value="crypto_swap" selected>Permuta cripto a cripto</option><option value="staking">Staking y recompensas</option><option value="mining">Minería y validación</option><option value="holding">Tenencia y declaración</option></select></div><div class="kf-field"><label for="fiscal-profile">Perfil</label><select class="kf-select" id="fiscal-profile" data-fiscal-profile><option value="individual-investor">Persona física · inversión</option><option value="individual-business">Persona física · actividad</option><option value="company">Sociedad</option></select></div><div class="kf-field"><label for="fiscal-holding">Días de tenencia</label><input id="fiscal-holding" type="number" min="0" step="1" value="400" data-fiscal-holding></div><div class="kf-field"><label for="fiscal-proceeds">Valor de salida</label><input id="fiscal-proceeds" type="number" min="0" step="0.01" placeholder="Necesario para calcular" data-fiscal-proceeds></div><div class="kf-field"><label for="fiscal-cost">Coste fiscal ajustado</label><input id="fiscal-cost" type="number" min="0" step="0.01" placeholder="Necesario para calcular" data-fiscal-cost></div><div class="kf-field"><label for="fiscal-prior-base">Base fiscal previa del año</label><input id="fiscal-prior-base" type="number" min="0" step="0.01" value="0" data-fiscal-prior-base></div><div class="kf-field"><label for="fiscal-filing">Estado de declaración</label><select class="kf-select" id="fiscal-filing" data-fiscal-filing-status><option value="single">Individual</option><option value="joint">Conjunta / matrimonio</option><option value="head">Cabeza de familia</option><option value="separate">Matrimonio separado</option></select></div><div class="kf-field"><label for="fiscal-context">Tratamiento del activo</label><select class="kf-select" id="fiscal-context" data-fiscal-tax-context><option value="standard">Regla general</option></select></div><div class="kf-field"><label for="fiscal-turnover">Volumen anual de actividad</label><input id="fiscal-turnover" type="number" min="0" step="0.01" value="0" data-fiscal-turnover></div><div class="kf-field"><label for="fiscal-custody">Custodia</label><select class="kf-select" id="fiscal-custody" data-fiscal-custody><option value="self">Self-custody</option><option value="domestic">Proveedor nacional</option><option value="foreign">Proveedor extranjero</option></select></div><button class="kf-button primary" type="submit">Calcular impacto fiscal →</button></form><div class="kf-fiscal-result" data-fiscal-scenario-result><div class="kf-live-empty">Esperando el registro fiscal conectado…</div></div></section>

        <div class="kf-section-head kf-fiscal-section-head"><div><p class="kf-kicker">Comparación por jurisdicción</p><h2 class="kf-title small">Compara el tratamiento del mismo evento.</h2></div><p class="kf-intro">La tabla contrasta hecho fiscal, categoría, mecanismo, momento, obligaciones de información y límites de cada jurisdicción.</p></div><div class="kf-fiscal-compare-controls"><div class="kf-field"><label for="fiscal-left">Jurisdicción A</label><select class="kf-select" id="fiscal-left" data-fiscal-left><option>Esperando…</option></select></div><div class="kf-field"><label for="fiscal-right">Jurisdicción B</label><select class="kf-select" id="fiscal-right" data-fiscal-right><option>Esperando…</option></select></div><div class="kf-field"><label for="fiscal-compare-event">Evento comparable</label><select class="kf-select" id="fiscal-compare-event" data-fiscal-compare-event><option value="crypto_swap">Permuta cripto a cripto</option><option value="sell_fiat">Venta a moneda fiat</option><option value="staking">Staking y recompensas</option><option value="mining">Minería y validación</option><option value="holding">Tenencia y declaración</option></select></div></div><div data-fiscal-comparison><div class="kf-live-empty">Conectando matriz comparativa…</div></div>

        <div class="kf-section-head kf-fiscal-section-head"><div><p class="kf-kicker">Cambios normativos verificados</p><h2 class="kf-title small">Actualizaciones con efecto fiscal.</h2></div><p class="kf-intro">Solo se publican cambios con fuente oficial y efecto operativo identificable. Una actualización técnica de una página no se clasifica como cambio legal.</p></div><div class="kf-fiscal-change-list" data-fiscal-changes><div class="kf-live-empty">Esperando señales verificadas…</div></div>

        <div class="kf-section-head kf-fiscal-section-head"><div><p class="kf-kicker">Cobertura y fuentes</p><h2 class="kf-title small">Qué está verificado y qué no.</h2></div><p class="kf-intro">La monitorización diaria comprueba si una fuente responde. La vigencia jurídica solo cambia tras revisar el contenido.</p></div><div class="kf-fiscal-quality"><div class="kf-fiscal-quality-grid"><article><span>Hechos con fuente</span><strong data-fiscal-quality="facts_with_source_pct">—</strong><small>Conclusiones enlazadas</small></article><article><span>Cobertura jurisdiccional</span><strong data-fiscal-quality="primary_jurisdiction_coverage_pct">—</strong><small>Al menos una fuente oficial</small></article><article><span>Fuentes comprobadas</span><strong data-fiscal-quality="checked_source_count">—</strong><small>Disponibilidad técnica diaria</small></article><article><span>Fuentes accesibles</span><strong data-fiscal-quality="reachable_source_pct">—</strong><small>No certifica vigencia legal</small></article></div><div class="kf-fiscal-source-register" data-fiscal-source-register><div class="kf-live-empty">Esperando registro de fuentes…</div></div></div>

        <div class="kf-rwa-method kf-fiscal-method"><div><span>UNIDAD DE COMPARACIÓN</span><strong>Jurisdicción × evento fiscal × perfil</strong></div><div><span>ACTUALIZACIÓN</span><strong>Fuentes comprobadas cada 24 h · revisión jurídica cuando cambia el contenido</strong></div><div><span>NO CALCULA</span><strong>Cuota final, residencia recomendada o exención garantizada</strong></div><p data-fiscal-methodology>Fiscalidad informativa. Si faltan residencia, actividad o calificación del activo, Kaufman bloquea la conclusión.</p></div>
      </div></section></main>`;
  }

  function compareFields(type){
    const items=CATALOGS[type]?.items||[];
    return [...new Set(items.flatMap((item)=>Object.keys(item.fields||{})))];
  }
  function compareTableMarkup(type,leftId,rightId){
    const catalog=CATALOGS[type];
    const left=catalog.items.find((item)=>item.id===leftId)||catalog.items[0];
    const right=catalog.items.find((item)=>item.id===rightId)||catalog.items[1]||catalog.items[0];
    const fields=compareFields(type);
    const value=(item,field)=>item.fields?.[field]||MISSING_VALUE;
    const cell=(content)=>`<span${content===MISSING_VALUE?' class="kf-muted-value"':''}>${escapeHtml(content)}</span>`;
    return `<div class="kf-compare-grid"><div class="kf-compare-cell label heading">Campo</div><div class="kf-compare-cell heading">${left.name}<br>${statusBadge(left.status)}</div><div class="kf-compare-cell heading">${right.name}<br>${statusBadge(right.status)}</div>${fields.map((field)=>`<div class="kf-compare-cell label">${field}</div><div class="kf-compare-cell">${cell(value(left,field))}</div><div class="kf-compare-cell">${cell(value(right,field))}</div>`).join('')}</div>`;
  }

  function compareToolMarkup(){
    const categories=['fiscal','exchanges','wallets','bancos','hardware','proyectos'];
    const type='fiscal',items=CATALOGS[type].items;
    const options=(list)=>list.map((item)=>`<option value="${item.id}">${item.name}</option>`).join('');
    return `<section class="kf-fiscal-compare"><div class="kf-cost-heading"><p class="kf-kicker">Comparación fiscal y operativa</p><h2>Dos fichas, los mismos campos.</h2><p>Compara jurisdicciones, exchanges, wallets, bancos, hardware o proyectos con un contrato común. Cuando una fuente no cubre un campo, la celda lo declara sin completarlo por inferencia.</p></div><div class="kf-compare-controls"><div class="kf-field"><label for="compare-type">Categoría</label><select class="kf-select" id="compare-type" data-compare-type>${categories.map((key)=>`<option value="${key}">${CATALOGS[key].label}</option>`).join('')}</select></div><div class="kf-field"><label for="compare-left">Ficha A</label><select class="kf-select" id="compare-left" data-compare-left>${options(items)}</select></div><div class="kf-field"><label for="compare-right">Ficha B</label><select class="kf-select" id="compare-right" data-compare-right>${options(items).replace(`value="${items[1].id}"`,`value="${items[1].id}" selected`)}</select></div><a class="kf-button small secondary" href="/fuentes/">Criterios</a></div><div data-compare-table>${compareTableMarkup(type,items[0].id,items[1].id)}</div><div class="kf-data-note"><span>${statusBadge('verified')}</span><div><strong>Comparador basado en fichas con fuente</strong><p>Las diferencias de cobertura se muestran como tales; no se sustituyen por valores estimados.</p></div><a href="/fuentes/">Registro de fuentes →</a></div></section>`;
  }

  function renderProfile(typeOverride){
    const params=new URLSearchParams(location.search);
    const type=typeOverride||params.get('tipo')||'fiscal';
    const id=params.get('id')||CATALOGS[type]?.items?.[0]?.id;
    const catalog=CATALOGS[type];
    const item=catalog?.items.find((entry)=>entry.id===id);
    if(!catalog||!item)return renderNotFound('Ficha no encontrada');
    const profileFields=type==='bancos'?bankFields(item):(item.fields||{});
    const facts=Object.entries(profileFields).map(([key,value])=>`<div class="kf-fact"><dt>${key}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
    const sourceItems=itemSources(item);
    const source=sourceItems.length?sourceItems.map((entry)=>`<div class="kf-source-item"><strong>${escapeHtml(entry.name)}</strong><span>${escapeHtml(entry.type)}</span><a href="${entry.url}" target="_blank" rel="noopener noreferrer">Abrir fuente ↗</a></div>`).join(''):`<div class="kf-source-item"><strong>Fuente</strong><span>No publicada; ficha bloqueada</span></div>`;
    return `<main class="kf-main" id="main-content">${pageHero(item.name,item.subtitle,`Ficha / ${catalog.label}`,item.status)}<section class="kf-section"><div class="kf-container"><div class="kf-profile"><article class="kf-profile-main"><div class="kf-profile-title"><div><h2>${item.name}</h2><p>${item.subtitle}</p></div>${statusBadge(item.status)}</div><dl class="kf-fact-list">${facts}</dl></article><aside class="kf-source-panel"><h3>Prueba del dato</h3>${source}<div class="kf-source-item"><strong>Fuentes</strong><a href="/fuentes/">Ver fuente y alcance →</a></div></aside></div><div style="margin-top:24px"><a class="kf-button secondary" href="/${type}/">← Volver a ${catalog.label}</a></div></div></section></main>`;
  }

  function renderSources(){
    const sources=[
      {name:'Coinbase Exchange',scope:'Mercado BTC y ETH para la mediana Kaufman',cadence:'Captura server-side automática · objetivo 5 minutos',status:'auto',url:'https://docs.cdp.coinbase.com/exchange/reference/exchangerestapi_getproductticker'},
      {name:'Kraken Spot',scope:'Mercado BTC y ETH para la mediana Kaufman',cadence:'Captura server-side automática · objetivo 5 minutos',status:'auto',url:'https://docs.kraken.com/api/docs/rest-api/get-ticker-information'},
      {name:'Binance Spot',scope:'Mercado adicional y pares de conversión de stablecoins',cadence:'Conector WebSocket server-side disponible; no usado si la publicación estática no puede mantener conexión',status:'auto',url:'https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams'},
      {name:'DEX Screener API',scope:'Pools por chainId + contractAddress',cadence:'Snapshot público diario',status:'auto',url:'https://docs.dexscreener.com/api/reference'},
      {name:'DefiLlama Open API',scope:'TVL RWA, clases de activo, redes, stablecoins y adaptadores auditables',cadence:'Snapshot público diario',status:'auto',url:'https://defillama.com/docs/api'},
      {name:'ByKaranteli · ETF flows',scope:'Histórico finalizado de flujos netos de ETF spot estadounidenses para BTC y ETH',cadence:'Diaria tras cierre de mercado · 90 días publicados',status:'auto',url:'https://bykaranteli.com/data'},
      {name:'CoinFlows ETF tracker',scope:'Contraste de la última sesión agregada de ETF spot estadounidenses',cadence:'Diaria tras cierre de mercado',status:'auto',url:'https://coinflows.org/'},
      {name:'iShares · BlackRock',scope:'Acciones en circulación de IBIT y ETHA para contrastar dirección de creación o reembolso',cadence:'Diaria · fuente del emisor',status:'auto',url:'https://www.ishares.com/us/products/333011/ishares-bitcoin-trust-etf'},
      {name:'L2BEAT Public API',scope:'TVS, etapa, stack, disponibilidad de datos y matriz de riesgos L2',cadence:'Snapshot diario · traducción explicativa en español',status:'auto',url:'https://l2beat.com/api/scaling/summary'},
      {name:'CoinGecko',scope:'Solo metadatos, categorías, capitalización, oferta, imágenes e IDs',cadence:'Segundo plano · nunca ticker',status:'auto',url:'https://docs.coingecko.com/reference/coins-markets'},
      {name:'Ethereum JSON-RPC · PublicNode',scope:'Base fee EIP-1559, propinas percentiles 10/50/90 y coste de transferencia',cadence:'Snapshot público diario',status:'auto',url:'https://ethereum.org/es/developers/docs/apis/json-rpc/#eth_feehistory'},
      {name:'Kraken AssetPairs API',scope:'Comisión maker/taker de BTC/USD',cadence:'Diaria · server-side',status:'auto',url:'https://docs.kraken.com/api/docs/rest-api/get-tradable-asset-pairs'},
      {name:'BOE Datos Abiertos',scope:'Normativa española relacionada con blockchain',cadence:'Diaria',status:'auto',url:'https://www.boe.es/datosabiertos/api/api.php'},
      {name:'Federal Register API',scope:'SEC y CFTC · Estados Unidos',cadence:'Diaria',status:'auto',url:'https://www.federalregister.gov/developers/documentation/api/v1'},
      {name:'EUR-Lex · MiCA',scope:'Texto primario del Reglamento (UE) 2023/1114',cadence:'Monitor diario · revisión jurídica',status:'auto',url:'https://eur-lex.europa.eu/eli/reg/2023/1114/oj?locale=es'},
      {name:'ESMA · MiCA artículo 59',scope:'Autorización de proveedores de servicios de criptoactivos',cadence:'Monitor diario · single rulebook',status:'auto',url:'https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-59-authorisation'},
      {name:'CNMV · MiCA',scope:'Aplicación y periodo transitorio en España',cadence:'Monitor diario · guía oficial',status:'auto',url:'https://www.cnmv.es/Portal/mica/regulacion-criptoactivos?lang=es'},
      {name:'México · Ley Fintech',scope:'Texto vigente de la LRITF',cadence:'Monitor diario · texto consolidado',status:'auto',url:'https://www.diputados.gob.mx/LeyesBiblio/pdf/LRITF.pdf'},
      {name:'Banco de México · Circular 4/2019',scope:'Operaciones reguladas con activos virtuales',cadence:'Monitor diario · texto compilado',status:'auto',url:'https://www.banxico.org.mx/marco-normativo/normativa-emitida-por-el-banco-de-mexico/circular-4-2019/circular-4-2019.html'},
      {name:'CBUAE · Payment Token Services',scope:'Emisión, conversión, custodia y transferencia',cadence:'Monitor diario · rulebook oficial',status:'auto',url:'https://rulebook.centralbank.ae/en/rulebook/payment-token-services-regulation'},
      {name:'VARA · Virtual Assets Regulations',scope:'Dubái, salvo DIFC',cadence:'Monitor diario · rulebook oficial',status:'auto',url:'https://rulebooks.vara.ae/rulebook/virtual-assets-and-related-activities-regulations-2023'},
      {name:'Google News RSS',scope:'Actualidad regulatoria internacional y noticias mineras',cadence:'Diaria',status:'auto',url:'https://news.google.com/'},
      {name:'Traducción automática de titulares',scope:'Castellano de España; se conserva el enlace y titular original',cadence:'Durante el build diario · sin claves en el navegador',status:'auto',url:'https://translate.google.com/'},
      {name:'mempool.space API',scope:'Hashrate de red y altura de bloque de Bitcoin',cadence:'Diaria',status:'auto',url:'https://mempool.space/docs/api/rest'},
      {name:'BITMAIN Support',scope:'Especificaciones del Antminer S21 XP',cadence:'Referencia oficial',status:'verified',url:'https://support.bitmain.com/hc/en-us/articles/35383015643673-S21-XP-Specifications'},
      {name:'SEC EDGAR Submissions',scope:'Empresas cotizadas y filings corporativos',cadence:'Consulta pública',status:'auto',url:'https://www.sec.gov/edgar/sec-api-documentation'},
      {name:'GitHub Releases · wallets',scope:'Última versión publicada de Ledger Wallet, Trezor Suite y MetaMask',cadence:'Snapshot público diario · server-side',status:'auto',url:'https://docs.github.com/en/rest/releases/releases#get-the-latest-release'},
      {name:'Safe Docs',scope:'Propietarios, umbral, módulos y guards de una cuenta inteligente',cadence:'Referencia técnica primaria',status:'verified',url:'https://docs.safe.global/advanced/smart-account-concepts'},
      {name:'IPFS · Filecoin · The Graph · ENS',scope:'Direccionamiento, persistencia, indexación e identidad Web3',cadence:'Referencias técnicas primarias',status:'verified',url:'https://ethereum.org/developers/docs/'},
      {name:'OWASP Smart Contract Top 10',scope:'Taxonomía de riesgos de contratos inteligentes',cadence:'Edición 2026',status:'verified',url:'https://scs.owasp.org/sctop10/'}
    ];
    return `<main class="kf-main" id="main-content">${pageHero('Fuentes','Registro visible de proveedores, cobertura, cadencia y estado de cada integración.','Trazabilidad')}${priceMethodologyMarkup()}${providerHealthMarkup()}<section class="kf-section"><div class="kf-container"><div class="kf-section-head"><div><p class="kf-kicker">Registro completo</p><h2 class="kf-title small">Todas las fuentes publicadas.</h2></div><p class="kf-intro">Cobertura, frecuencia y enlace primario de cada integración utilizada por Kaufman.</p></div><div class="kf-source-register">${sources.map((source)=>`<div class="kf-source-row"><strong>${source.name}</strong><span>${source.scope}</span><span>${source.cadence}</span><div>${statusBadge(source.status)}${source.url?` <a href="${source.url}" target="_blank" rel="noopener noreferrer">Abrir ↗</a>`:''}</div></div>`).join('')}</div></div></section></main>`;
  }

  function renderLegal(kind){
    const pages={
      aviso:{title:'Aviso legal',description:'Identidad del titular, alcance informativo, propiedad y reglas de utilización de Kaufman.',summary:'Este aviso regula el acceso a kaufmanadvisory.io y a las páginas públicas de Kaufman. La plataforma informa; no ejecuta operaciones ni presta asesoramiento personalizado.',sections:[
        ['1. Titular y contacto','<dl><div><dt>Titular</dt><dd>Kaufman Advisory Group LLC</dd></div><div><dt>Constitución</dt><dd>Limited Liability Company · Wyoming, Estados Unidos</dd></div><div><dt>Nombre público</dt><dd>Kaufman</dd></div><div><dt>Dominio</dt><dd>kaufmanadvisory.io</dd></div><div><dt>Contacto</dt><dd><a href="mailto:contact@kaufmanadvisory.io">contact@kaufmanadvisory.io</a></dd></div></dl><p>Los identificadores fiscales no se publican como credenciales de contacto. Las solicitudes legítimas sobre información registral pueden dirigirse al correo indicado.</p>'],
        ['2. Objeto de la plataforma','<p>Kaufman organiza información pública y datos técnicos sobre blockchain, mercados, tokenización, regulación, fiscalidad, entidades, minería, hardware y riesgos. El servicio no mantiene fondos, no transmite órdenes, no ofrece custodia y no intermedia pagos.</p>'],
        ['3. Información, no asesoramiento','<p>El contenido es general y educativo. No constituye asesoramiento jurídico, fiscal, financiero, contable, técnico o de inversión; tampoco una oferta, recomendación o invitación para comprar, vender, custodiar, tokenizar o minar activos. La consulta de la plataforma no crea una relación profesional ni fiduciaria.</p>'],
        ['4. Estados y límites del dato','<p>Kaufman diferencia información automática, verificada, interpretativa, en snapshot y no disponible. Los precios pueden sufrir latencia; la normativa puede depender de fechas, residencia, actividad y hechos no conocidos por la plataforma. La fuente original prevalece ante cualquier discrepancia.</p>'],
        ['5. Uso permitido','<ul><li>Consultar, citar y enlazar contenido para fines lícitos, respetando autoría y fuentes.</li><li>No alterar un dato y atribuirlo a Kaufman.</li><li>No presentar una interpretación como verificación jurídica.</li><li>No eludir controles técnicos, sobrecargar el servicio, extraer datos de forma abusiva ni utilizar la plataforma para fraude o actividades ilícitas.</li></ul>'],
        ['6. Propiedad intelectual y reutilización','<p>El diseño, código propio, estructura editorial, textos, taxonomías y análisis de Kaufman pertenecen a Kaufman Advisory Group LLC. Marcas, logotipos, documentos, imágenes y datos de terceros pertenecen a sus titulares y se utilizan conforme a sus condiciones. El acceso gratuito no concede una licencia de redistribución comercial masiva.</p>'],
        ['7. Fuentes, APIs y enlaces externos','<p>La plataforma enlaza administraciones, reguladores, redes, protocolos, medios y proveedores de datos. Kaufman no controla sus políticas, licencias, disponibilidad o cambios posteriores. Abrir un enlace externo implica utilizar un servicio independiente bajo sus propios términos.</p>'],
        ['8. Disponibilidad, cambios y correcciones','<p>Kaufman puede actualizar, corregir, suspender o retirar datos y funcionalidades. Una fuente caída puede convertir un dato en no disponible. Los errores materiales pueden comunicarse a <a href="mailto:contact@kaufmanadvisory.io?subject=Corrección%20de%20dato">contact@kaufmanadvisory.io</a> indicando URL, dato afectado y fuente de contraste.</p>'],
        ['9. Responsabilidad','<p>Kaufman aplica controles de calidad razonables, pero no garantiza disponibilidad ininterrumpida, ausencia absoluta de errores ni adecuación a una decisión concreta. Nada en este aviso excluye responsabilidades que no puedan limitarse legalmente ni los derechos imperativos de consumidores.</p>'],
        ['10. Ley aplicable y controversias','<p>La entidad operadora está constituida en Wyoming, Estados Unidos. La ley y jurisdicción aplicables se determinarán conforme a las normas imperativas y de conflicto correspondientes, sin privar al usuario de la protección obligatoria que le reconozca su lugar de residencia. Antes de acudir a un tribunal, puede solicitarse una solución escrita mediante el correo de contacto.</p>'],
        ['11. Vigencia','<p>Versión publicada el 13 de julio de 2026. Las modificaciones materiales se reflejarán en esta página con una nueva fecha.</p>']
      ]},
      privacidad:{title:'Política de privacidad',description:'Datos tratados, finalidades, bases jurídicas, proveedores, conservación y derechos.',summary:'Kaufman minimiza la recogida de datos: no tiene cuentas, pagos ni formularios fiscales. La analítica externa permanece desactivada hasta que el visitante la acepta.',sections:[
        ['1. Responsable y alcance','<dl><div><dt>Responsable</dt><dd>Kaufman Advisory Group LLC · Wyoming, Estados Unidos</dd></div><div><dt>Sitio</dt><dd>kaufmanadvisory.io</dd></div><div><dt>Privacidad</dt><dd><a href="mailto:contact@kaufmanadvisory.io?subject=Privacidad">contact@kaufmanadvisory.io</a></dd></div></dl><p>Esta política se aplica a la navegación pública por Kaufman y a los mensajes enviados voluntariamente al correo indicado.</p>'],
        ['2. Datos que pueden tratarse','<ul><li><strong>Datos técnicos:</strong> dirección IP, fecha y hora, ruta solicitada, cabeceras, navegador, dispositivo y registros de seguridad generados por el servidor, hosting o CDN.</li><li><strong>Analítica opcional:</strong> identificador de cliente, páginas y eventos, sesión, ubicación aproximada e información de navegador o dispositivo, solo tras aceptar.</li><li><strong>Comunicaciones:</strong> correo, nombre, contenido y metadatos que el usuario envíe voluntariamente.</li><li><strong>Preferencia local:</strong> aceptación o rechazo de analítica guardado en el navegador.</li></ul><p>Kaufman no solicita claves privadas, seed phrases, contraseñas, documentos fiscales, datos bancarios ni información de pagos.</p>'],
        ['3. Finalidades y bases jurídicas','<dl><div><dt>Entrega y seguridad</dt><dd>Operar, proteger y diagnosticar el sitio · interés legítimo y necesidad técnica.</dd></div><div><dt>Analítica</dt><dd>Medir uso agregado y mejorar la experiencia · consentimiento.</dd></div><div><dt>Correo</dt><dd>Responder a la solicitud del remitente · petición del interesado e interés legítimo.</dd></div><div><dt>Obligaciones</dt><dd>Atender requerimientos válidos y defender derechos · obligación legal o interés legítimo.</dd></div></dl>'],
        ['4. Analítica y consentimiento','<p>Google Tag Manager, Google Analytics 4 y GoatCounter no se cargan desde esta interfaz antes de aceptar. GA4 puede recopilar estadísticas de sesión, ubicación aproximada, navegador, dispositivo y un identificador de cliente. Rechazar no impide utilizar Kaufman. La elección se conserva en <code>kaufman_analytics_consent</code>, puede retirarse mediante “Gestionar analítica” en el footer y se explica en la <a href="/politica-cookies.html">Política de cookies</a>.</p>'],
        ['5. Destinatarios y encargados','<ul><li>GitHub Pages y Cloudflare, para hosting, CDN, entrega y seguridad del sitio.</li><li>Zoho, para procesar los mensajes enviados a Kaufman.</li><li>Google Ireland Limited y Google LLC, según las condiciones aplicables, para Tag Manager y Analytics 4, únicamente con consentimiento.</li><li>GoatCounter, para medición estadística, únicamente con consentimiento.</li><li>Autoridades o asesores cuando exista una obligación o necesidad jurídica válida.</li></ul><p>Kaufman no vende información personal ni la comparte para publicidad comportamental propia. Google mantiene sus propias funciones como proveedor y sus condiciones de tratamiento deben consultarse antes de modificar la configuración analítica.</p>'],
        ['6. Transferencias internacionales','<p>La entidad responsable está en Estados Unidos y algunos proveedores pueden procesar datos fuera del país del visitante. Google declara su adhesión al Marco de Privacidad de Datos UE–EE. UU.; cuando ese marco no resulte aplicable, sus condiciones contemplan otros mecanismos, incluidas cláusulas contractuales tipo. La base concreta debe comprobarse frente a la entidad contratante y la configuración vigentes. La activación voluntaria de analítica no elimina las obligaciones del responsable.</p><ul><li><a href="https://www.dataprivacyframework.gov/list" target="_blank" rel="noopener noreferrer">Lista oficial del Data Privacy Framework ↗</a></li><li><a href="https://privacy.google.com/businesses/processorterms/" target="_blank" rel="noopener noreferrer">Condiciones de tratamiento de datos de Google ↗</a></li></ul>'],
        ['7. Conservación','<dl><div><dt>Preferencia de analítica</dt><dd>Hasta cambiarla o borrar el almacenamiento del navegador.</dd></div><div><dt>Registros técnicos</dt><dd>Durante el periodo necesario para seguridad, diagnóstico y obligaciones del proveedor.</dd></div><div><dt>Analítica</dt><dd>Según la configuración de retención vigente en cada proveedor.</dd></div><div><dt>Correos</dt><dd>Mientras sea necesario para responder y, después, durante los plazos exigibles para obligaciones o reclamaciones.</dd></div></dl><p>Kaufman no fija públicamente un plazo numérico cuando la configuración de producción todavía no está confirmada.</p>'],
        ['8. Derechos','<p>Cuando la normativa aplicable lo reconozca, puedes solicitar acceso, rectificación, supresión, oposición, limitación, portabilidad y no ser objeto de decisiones automatizadas. También puedes retirar el consentimiento sin afectar al tratamiento previo.</p><p>Envía la solicitud a <a href="mailto:contact@kaufmanadvisory.io?subject=Ejercicio%20de%20derechos">contact@kaufmanadvisory.io</a>. Kaufman podrá pedir información proporcionada y necesaria para verificar identidad. Si el RGPD resulta aplicable, puedes reclamar ante la autoridad de control competente; en España, la AEPD.</p>'],
        ['9. Seguridad y minimización','<p>Kaufman limita la recogida a lo necesario para las finalidades descritas y aplica medidas técnicas y organizativas proporcionadas. Ningún sistema es absolutamente seguro; una incidencia material se gestionará conforme a las obligaciones aplicables.</p>'],
        ['10. Menores','<p>La plataforma se dirige a una audiencia general y no está diseñada para recopilar deliberadamente datos de menores. Si un representante considera que un menor ha enviado información personal, puede solicitar su revisión y eliminación.</p>'],
        ['11. Decisiones automatizadas','<p>La versión actual no utiliza datos personales para conceder crédito, fijar precios individualizados, crear perfiles fiscales o adoptar decisiones con efectos jurídicos. Las respuestas automáticas de datos de mercado no se basan en la identidad del visitante.</p>'],
        ['12. Fuentes jurídicas y cambios','<p>La estructura informativa sigue los principios del RGPD, las orientaciones de la AEPD y, para la entidad estadounidense, los principios de transparencia de la FTC. Esta política se actualizará antes de incorporar cuentas, alertas personales, pagos o nuevos tratamientos.</p><ul><li><a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj" target="_blank" rel="noopener noreferrer">Reglamento General de Protección de Datos ↗</a></li><li><a href="https://www.aepd.es/derechos-y-deberes/ejerce-tus-derechos" target="_blank" rel="noopener noreferrer">Derechos de protección de datos · AEPD ↗</a></li><li><a href="https://www.ftc.gov/business-guidance/privacy-security/consumer-privacy" target="_blank" rel="noopener noreferrer">Consumer Privacy · FTC ↗</a></li></ul><p>Versión revisada el 24 de agosto de 2026.</p>']
      ]},
      cookies:{title:'Política de cookies',description:'Tecnologías utilizadas, proveedores, duración, consentimiento y forma de cambiar la elección.',summary:'Kaufman no activa Google Analytics, Google Tag Manager ni GoatCounter hasta que el visitante acepta expresamente. Rechazar mantiene disponible toda la plataforma.',sections:[
        ['1. Responsable y alcance','<p>Kaufman Advisory Group LLC · Wyoming, Estados Unidos es responsable de las tecnologías descritas en esta política para <strong>kaufmanadvisory.io</strong>. Puedes escribir a <a href="mailto:contact@kaufmanadvisory.io?subject=Cookies%20y%20analítica">contact@kaufmanadvisory.io</a>.</p>'],
        ['2. Qué utiliza Kaufman','<p>La plataforma usa almacenamiento local para recordar la elección de analítica. Si el visitante acepta, carga Google Tag Manager, Google Analytics 4 y GoatCounter. Si rechaza, esos tres proveedores no se cargan desde la interfaz de Kaufman.</p>'],
        ['3. Inventario actual','<dl><div><dt><code>kaufman_analytics_consent</code></dt><dd>Origen Kaufman · almacenamiento local · guarda “accepted” o “rejected” hasta que el usuario lo cambie o borre los datos del navegador.</dd></div><div><dt><code>_ga</code> y <code>_ga_*</code></dt><dd>Google Analytics 4 · medición de visitantes y sesiones · solo tras aceptar · duración máxima habitual de hasta 2 años, sujeta a la configuración vigente.</dd></div><div><dt>Google Tag Manager</dt><dd>Gestor de etiquetas · no se carga antes de aceptar; las tecnologías finales dependen de las etiquetas publicadas en el contenedor.</dd></div><div><dt>GoatCounter</dt><dd>Medición estadística configurada sin cookies; Kaufman también la mantiene bloqueada hasta la aceptación.</dd></div></dl>'],
        ['4. Finalidad y base jurídica','<p>La única finalidad opcional es medir el uso agregado, detectar problemas de navegación y mejorar el contenido. La base jurídica es el consentimiento. No aceptar o retirar el consentimiento no limita el acceso a Kaufman.</p>'],
        ['5. Terceros y transferencias','<p>Google Ireland Limited y Google LLC pueden tratar datos de Analytics y Tag Manager conforme a sus condiciones. Google declara su adhesión al Marco de Privacidad de Datos UE–EE. UU. y contempla mecanismos adicionales cuando resulte necesario. GoatCounter procesa estadísticas según su propia política. Kaufman no utiliza esta analítica para publicidad comportamental propia.</p><ul><li><a href="https://policies.google.com/technologies/cookies?hl=es" target="_blank" rel="noopener noreferrer">Uso de cookies por Google ↗</a></li><li><a href="https://privacy.google.com/businesses/processorterms/" target="_blank" rel="noopener noreferrer">Condiciones de tratamiento de Google ↗</a></li><li><a href="https://www.dataprivacyframework.gov/list" target="_blank" rel="noopener noreferrer">Lista oficial del Data Privacy Framework ↗</a></li><li><a href="https://www.goatcounter.com/help/privacy" target="_blank" rel="noopener noreferrer">Privacidad de GoatCounter ↗</a></li></ul>'],
        ['6. Aceptar, rechazar o retirar','<p>El panel inicial ofrece “Rechazar” y “Aceptar”. Puedes cambiar la elección en cualquier momento mediante “Gestionar analítica” en el footer. Al abrir de nuevo el panel se detiene la carga analítica y se eliminan, cuando son accesibles desde este dominio, las cookies analíticas conocidas; después puedes aceptar o rechazar de nuevo. También puedes borrar cookies y almacenamiento local desde el navegador.</p>'],
        ['7. Cambios','<p>La lista se revisará antes de añadir una etiqueta, proveedor o finalidad. Versión revisada el 24 de agosto de 2026.</p>']
      ]},
      terminos:{title:'Términos de uso',description:'Condiciones para acceder y utilizar la plataforma informativa Kaufman.',sections:[
        ['1. Objeto','Estos términos regulan el acceso a Kaufman, una plataforma informativa operada por Kaufman Advisory Group LLC. La versión actual no ofrece contratación de asesoría, suscripciones ni pagos.'],
        ['2. Uso permitido','Puedes consultar y enlazar el contenido para fines lícitos. No debes eludir controles técnicos, interferir con el servicio, atribuir a Kaufman datos modificados ni presentar una interpretación como información jurídicamente verificada.'],
        ['3. Alcance de la información','Los datos de mercado pueden contener latencia o interrupciones. La normativa puede cambiar, estar sujeta a transición o depender del caso. El estado de cada registro forma parte esencial del contenido.'],
        ['4. Decisiones del usuario','El uso de la plataforma no crea una relación de asesoramiento. Eres responsable de verificar la fuente y obtener criterio profesional antes de tomar decisiones legales, fiscales, financieras, técnicas o de inversión.'],
        ['5. Servicios de terceros','APIs, fuentes, enlaces y herramientas externas se rigen por sus propios términos. Su inclusión no implica recomendación, certificación ni garantía.'],
        ['6. Disponibilidad y cambios','Kaufman puede corregir, actualizar, retirar o reestructurar contenido y funcionalidades. Cuando una fuente falla, el dato puede mostrarse como no disponible.'],
        ['7. Contacto','Las preguntas sobre estos términos pueden enviarse a contact@kaufmanadvisory.io.']
      ]}
    };
    const legal=pages[kind]||pages.aviso;
    return `<main class="kf-main" id="main-content">${pageHero(legal.title,legal.description,'Legal / actualizado 24 agosto 2026','verified')}<section class="kf-section"><div class="kf-container"><article class="kf-legal"><header class="kf-legal-header"><span>Versión 1.1 · 24 agosto 2026</span><p>${legal.summary||legal.description}</p></header>${legal.sections.map(([title,copy])=>`<section><h2>${title}</h2><div class="kf-legal-copy">${copy}</div></section>`).join('')}<p class="kf-legal-note">Documento operativo basado en el tratamiento actual. La incorporación de cuentas, pagos, perfilado, publicidad comportamental o nuevos proveedores exige una revisión previa de este texto y de la configuración técnica.</p></article></div></section></main>`;
  }

  function renderContact(){
    const email='contact@kaufmanadvisory.io';
    const params=new URLSearchParams(location.search);
    const isDecisionBrief=params.get('asunto')==='decision-brief';
    const operation=params.get('operacion')||params.get('territorio')||params.get('origen')||'';
    const jurisdiction=params.get('jurisdiccion')||'';
    const operationLabel={operar:'Operar o invertir',tokenizar:'Tokenizar un activo',custodiar:'Elegir custodia',infraestructura:'Infraestructura Web3',mineria:'Operación minera'}[operation]||operation;
    const jurisdictionLabel={ES:'España',UE:'Unión Europea',US:'Estados Unidos',GB:'Reino Unido',AE:'Emiratos Árabes Unidos',CH:'Suiza',SG:'Singapur',MX:'México'}[jurisdiction]||jurisdiction;
    const context=[operation&&`Operación: ${operationLabel}`,jurisdiction&&`Jurisdicción: ${jurisdictionLabel}`].filter(Boolean).join(' · ');
    const matters=[
      ['Solicitar Kaufman Decision Brief','Indica la operación, jurisdicción, objetivo y fecha de decisión. Confirmaremos alcance, entrega, plazo y presupuesto antes de empezar.','Solicitud · Kaufman Decision Brief'],
      ['Corrección de un dato','Incluye la URL, el campo afectado y una fuente primaria de contraste.','Corrección de dato'],
      ['Fuentes e integraciones','Propón una API, registro o dataset público indicando licencia y frecuencia.','Fuente o integración'],
      ['Licencias y colaboración','Explica el caso de uso, la organización y la cobertura que necesitas.','Licencias y colaboración'],
      ['Privacidad o derechos','Indica el derecho que quieres ejercer y evita adjuntar información innecesaria.','Privacidad']
    ];
    const subject=isDecisionBrief?'Solicitud · Kaufman Decision Brief':'Contacto desde Kaufman';
    const body=isDecisionBrief?encodeURIComponent(`Hola Kaufman,\n\nQuiero solicitar un Decision Brief.\n${context}\n\nObjetivo de la decisión:\nFecha límite:\nContexto adicional:\n`):'';
    return `<main class="kf-main" id="main-content">${pageHero('Contacto',isDecisionBrief?'Delimita una operación y recibe una propuesta de alcance para convertir datos dispersos en una decisión comprobable.':'Un canal directo para solicitar un Decision Brief, corregir datos, proponer fuentes o hablar de colaboración.','Kaufman / contacto','verified')}<section class="kf-section"><div class="kf-container"><div class="kf-contact"><section class="kf-contact-primary"><p class="kf-kicker">${isDecisionBrief?'Solicitud de alcance':'Canal oficial'}</p><h2>${isDecisionBrief?'Cuéntanos qué decisión necesitas resolver.':'Escríbenos con contexto verificable.'}</h2><p>${isDecisionBrief?'No pedimos datos sensibles. Con la operación, jurisdicción, objetivo y fecha límite podemos confirmar qué fuentes y comprobaciones entran en la entrega.':'Kaufman no utiliza un formulario intermedio sin backend. El mensaje sale desde tu proveedor de correo y conserva una dirección de respuesta comprobable.'}</p>${context?`<div class="kf-contact-context"><span>Contexto recibido</span><strong>${escapeHtml(context)}</strong></div>`:''}<div class="kf-contact-address"><div><span>Correo</span><a href="mailto:${email}">${email}</a></div><button class="kf-button small secondary" type="button" data-contact-copy data-copy-value="${email}">Copiar correo</button></div><span class="kf-contact-copy-status" data-contact-copy-status aria-live="polite"></span><a class="kf-button primary" href="mailto:${email}?subject=${encodeURIComponent(subject)}${body?`&body=${body}`:''}">${isDecisionBrief?'Solicitar alcance y presupuesto':'Redactar correo'} →</a></section><aside class="kf-contact-security"><span>SEGURIDAD</span><h3>No envíes secretos ni fondos.</h3><ul><li>Nunca compartas seed phrases o claves privadas.</li><li>No envíes contraseñas, códigos de acceso ni archivos de wallet.</li><li>No adjuntes declaraciones fiscales completas ni documentos de identidad sin una solicitud legítima y un canal acordado.</li></ul><p>Kaufman no presta soporte por mensajes directos en redes sociales.</p></aside></div><div class="kf-contact-matters"><div class="kf-subsection-label">Motivo del contacto</div>${matters.map(([title,copy,matterSubject],index)=>`<article><span>${String(index+1).padStart(2,'0')}</span><div><h3>${title}</h3><p>${copy}</p></div><a href="mailto:${email}?subject=${encodeURIComponent(matterSubject)}">Escribir →</a></article>`).join('')}</div><div class="kf-contact-legal"><span>Responsable</span><strong>Kaufman Advisory Group LLC · Wyoming, Estados Unidos</strong><a href="/privacidad.html">Tratamiento de datos y derechos →</a></div></div></section></main>`;
  }

  function renderNotFound(title='Ruta no encontrada'){
    return `<main class="kf-main" id="main-content">${pageHero(title,'La ruta no existe o la ficha todavía no está registrada.','Error 404')}<section class="kf-section"><div class="kf-container"><a class="kf-button primary" href="/">Volver al inicio</a></div></section></main>`;
  }

  function renderRetired(){
    return `<main class="kf-main" id="main-content">${pageHero('Ruta retirada','Esta página pertenecía a la etapa de asesoría de Kaufman y ya no recibe pagos, solicitudes ni datos personales.','Kaufman')}<section class="kf-section"><div class="kf-container"><a class="kf-button primary" href="/">Entrar en Kaufman</a></div></section></main>`;
  }

  function renderPage(page){
    if(page==='home')return renderHome();
    if(page==='mercados')return renderMarkets();
    if(page==='tokenizacion')return renderTokenization();
    if(page==='fiscal')return renderFiscal();
    if(page==='ficha')return renderProfile();
    if(page==='fuentes')return renderSources();
    if(page==='contacto')return renderContact();
    if(page==='aviso'||page==='privacidad'||page==='cookies'||page==='terminos')return renderLegal(page);
    if(page==='retirado')return renderRetired();
    if(page==='regulacion')return renderDirectory(page);
    if(CATALOGS[page])return new URLSearchParams(location.search).has('id')?renderProfile(page):renderDirectory(page);
    return renderNotFound();
  }

  function allSearchEntries(){
    const routeEntries=ROUTES.map((route)=>({type:'Ruta',name:route.label,url:route.path}));
    const itemEntries=Object.entries(CATALOGS).flatMap(([type,catalog])=>catalog.items.map((item)=>({type:catalog.label,name:item.name,url:profileUrl(type,item.id)})));
    return [...routeEntries,...itemEntries,{type:'Sistema',name:'Fuentes',url:'/fuentes/'}];
  }

  function initSearch(){
    const overlay=document.querySelector('[data-search-overlay]');
    const input=overlay.querySelector('.kf-global-input');
    const results=overlay.querySelector('.kf-search-results');
    const entries=allSearchEntries();
    const draw=(query='')=>{
      const clean=query.trim().toLowerCase();
      const matches=(clean?entries.filter((entry)=>(entry.name+' '+entry.type).toLowerCase().includes(clean)):entries.slice(0,8)).slice(0,12);
      results.innerHTML=matches.length?matches.map((entry)=>`<a class="kf-search-result" href="${internalUrl(entry.url)}"><span class="kf-search-type">${entry.type}</span><strong>${entry.name}</strong><span>→</span></a>`).join(''):`<div class="kf-empty">Sin resultados.</div>`;
    };
    const open=()=>{overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.classList.add('search-open');draw();window.setTimeout(()=>input.focus(),0)};
    const close=()=>{overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('search-open')};
    document.querySelectorAll('[data-search-open]').forEach((button)=>button.addEventListener('click',open));
    overlay.querySelector('.kf-search-close').addEventListener('click',close);
    overlay.addEventListener('click',(event)=>{if(event.target===overlay)close()});
    document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&overlay.classList.contains('open'))close()});
    input.addEventListener('input',()=>draw(input.value));
  }

  function initMenu(){
    const button=document.querySelector('.kf-menu-button');
    const nav=document.getElementById('kf-nav');
    if(!button||!nav)return;
    button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open);document.body.classList.toggle('menu-open',!open)});
    nav.querySelectorAll('a').forEach((link)=>link.addEventListener('click',()=>{nav.classList.remove('open');button.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')}));
  }

  function initDirectoryFilters(){
    const search=document.querySelector('[data-directory-search]');
    const filter=document.querySelector('[data-status-filter]');
    if(!search||!filter)return;
    const records=[...document.querySelectorAll('[data-record]')];
    const count=document.querySelector('[data-result-count]');
    const empty=document.querySelector('[data-empty]');
    const apply=()=>{const query=search.value.trim().toLowerCase(),status=filter.value;let visible=0;records.forEach((record)=>{const show=record.dataset.name.includes(query)&&(status==='all'||record.dataset.status===status);record.hidden=!show;if(show)visible++});count.textContent=visible===1?'1 ficha':`${visible} fichas`;empty.hidden=visible!==0};
    search.addEventListener('input',apply);filter.addEventListener('change',apply);
  }

  function initBankRegistry(){
    const search=document.querySelector('[data-bank-search]');
    const region=document.querySelector('[data-bank-region]');
    if(!search||!region)return;
    const rows=[...document.querySelectorAll('[data-bank-record]')];
    const count=document.querySelector('[data-bank-count]');
    const empty=document.querySelector('[data-bank-empty]');
    const apply=()=>{
      const query=search.value.trim().toLowerCase();
      const selected=region.value;
      let visible=0;
      rows.forEach((row)=>{
        const show=row.dataset.bankSearch.includes(query)&&(selected==='all'||row.dataset.bankRegion===selected);
        row.hidden=!show;
        if(!show)row.open=false;
        if(show)visible++;
      });
      count.textContent=visible===1?'1 banco':`${visible} bancos`;
      empty.hidden=visible!==0;
    };
    search.addEventListener('input',apply);
    region.addEventListener('change',apply);
  }

  function initTokenizationFilters(){
    const dashboard=document.querySelector('[data-tokenization-dashboard]');
    if(!dashboard)return;
    const redraw=()=>renderTokenizationIntelligence(latestMarketSnapshot);
    dashboard.querySelectorAll('[data-token-product-search],[data-token-segment-filter],[data-token-network-filter],[data-token-product-sort]').forEach((control)=>control.addEventListener(control.matches('input')?'input':'change',redraw));
    dashboard.querySelector('[data-token-product-expand]')?.addEventListener('click',(event)=>{
      const root=dashboard.querySelector('[data-token-products]');
      if(!root)return;
      root.dataset.expanded=String(root.dataset.expanded!=='true');
      event.currentTarget.setAttribute('aria-expanded',root.dataset.expanded);
      redraw();
    });
    const input=dashboard.querySelector('[data-token-analyst-input]');
    dashboard.querySelectorAll('[data-token-question]').forEach((button)=>button.addEventListener('click',()=>{
      if(input)input.value=button.textContent.trim();
      renderTokenizationAnswer(button.dataset.tokenQuestion,latestMarketSnapshot?.tokenization_markets,latestMarketSnapshot?.l2_intelligence);
    }));
    dashboard.querySelector('[data-token-analyst-form]')?.addEventListener('submit',(event)=>{
      event.preventDefault();
      renderTokenizationAnswer(input?.value||'',latestMarketSnapshot?.tokenization_markets,latestMarketSnapshot?.l2_intelligence);
    });
  }

  function initFiscalDashboard(){
    const dashboard=document.querySelector('[data-fiscal-dashboard]');
    if(!dashboard||dashboard.dataset.initialized)return;
    dashboard.dataset.initialized='true';
    const redrawScenario=()=>{updateFiscalContextOptions();renderFiscalScenario(latestMarketSnapshot?.fiscal_intelligence)};
    dashboard.querySelector('[data-fiscal-scenario-form]')?.addEventListener('submit',(event)=>{event.preventDefault();redrawScenario()});
    dashboard.querySelectorAll('[data-fiscal-jurisdiction],[data-fiscal-event],[data-fiscal-profile],[data-fiscal-holding],[data-fiscal-proceeds],[data-fiscal-cost],[data-fiscal-prior-base],[data-fiscal-filing-status],[data-fiscal-tax-context],[data-fiscal-turnover],[data-fiscal-custody]').forEach((control)=>control.addEventListener(control.matches('input')?'input':'change',redrawScenario));
    dashboard.querySelectorAll('[data-fiscal-left],[data-fiscal-right],[data-fiscal-compare-event]').forEach((control)=>control.addEventListener('change',()=>renderFiscalComparison(latestMarketSnapshot?.fiscal_intelligence)));
  }

  function initComparator(){
    const typeSelect=document.querySelector('[data-compare-type]');
    if(!typeSelect)return;
    const left=document.querySelector('[data-compare-left]'),right=document.querySelector('[data-compare-right]'),table=document.querySelector('[data-compare-table]');
    const setOptions=(select,items,selectedIndex)=>{select.innerHTML=items.map((item,index)=>`<option value="${item.id}"${index===selectedIndex?' selected':''}>${item.name}</option>`).join('')};
    const draw=()=>{table.innerHTML=compareTableMarkup(typeSelect.value,left.value,right.value)};
    typeSelect.addEventListener('change',()=>{const items=CATALOGS[typeSelect.value].items;setOptions(left,items,0);setOptions(right,items,Math.min(1,items.length-1));draw()});
    left.addEventListener('change',draw);right.addEventListener('change',draw);
  }

  function savedFeedKeys(){
    try{return new Set(JSON.parse(window.localStorage.getItem('kaufman_saved_feed')||'[]'))}catch(error){return new Set()}
  }

  function syncFeedStars(){
    const saved=savedFeedKeys();
    document.querySelectorAll('[data-feed-star]').forEach((button)=>{const active=saved.has(button.dataset.feedKey);button.textContent=active?'★':'☆';button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-label',active?'Quitar de guardados':'Guardar noticia')});
  }

  function initFeedStars(){
    document.addEventListener('click',(event)=>{
      const button=event.target.closest('[data-feed-star]');
      if(!button)return;
      const saved=savedFeedKeys(),key=button.dataset.feedKey;
      if(saved.has(key))saved.delete(key);else saved.add(key);
      try{window.localStorage.setItem('kaufman_saved_feed',JSON.stringify([...saved]))}catch(error){}
      syncFeedStars();
    });
  }

  let miningCalculatorData=null;
  let miningChartRange=30;
  let miningCountriesExpanded=false;

  function miningEquipment(metrics,selected){
    return (metrics?.hardware_comparison||[]).find((row)=>row.id===selected)||metrics?.hardware_comparison?.[0]||metrics?.hardware||null;
  }

  function miningSensitivityMarkup(gross,energy,equipment){
    const root=document.querySelector('[data-mining-sensitivity-chart]');
    if(!root||!Number.isFinite(gross)||!Number.isFinite(energy))return;
    const costs=[.03,.05,.07,.09,.11,.13,.15];
    const rows=costs.map((cost)=>({cost,profit:gross-energy*cost}));
    const width=900,height=250,left=64,right=22,top=24,bottom=48,values=[0,...rows.map((row)=>row.profit)],min=Math.min(...values),max=Math.max(...values),span=Math.max(.01,max-min);
    const x=(index)=>left+index*(width-left-right)/(rows.length-1);
    const y=(value)=>top+(max-value)*(height-top-bottom)/span;
    const zero=y(0),points=rows.map((row,index)=>`${x(index).toFixed(1)},${y(row.profit).toFixed(1)}`).join(' ');
    root.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Resultado diario de ${escapeHtml(equipment?.model||'equipo')} para tarifas entre 0,03 y 0,15 dólares por kWh"><line class="zero" x1="${left}" x2="${width-right}" y1="${zero}" y2="${zero}"/><polyline points="${points}"/><g>${rows.map((row,index)=>`<circle cx="${x(index)}" cy="${y(row.profit)}" r="4"/><text x="${x(index)}" y="${height-19}" text-anchor="middle">${row.cost.toFixed(2)}</text><text class="value" x="${x(index)}" y="${Math.max(14,y(row.profit)-11)}" text-anchor="middle">${row.profit.toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1})}</text>`).join('')}</g><text class="axis" x="${left}" y="${height-3}">USD/kWh</text></svg>`;
    const title=document.querySelector('[data-mining-sensitivity-title]');
    if(title)title.textContent=`${equipment?.model||'Equipo'} · resultado diario`;
  }

  function drawMiningCalculatorLegacy(){
    const root=document.querySelector('[data-mining-calculator]');
    if(!root)return;
    const status=root.querySelector('[data-calc-status]'),grossNode=document.querySelector('[data-calc-gross]'),energyNode=document.querySelector('[data-calc-energy]'),powerNode=document.querySelector('[data-calc-power-cost]'),profitNode=document.querySelector('[data-calc-profit]'),monthNode=document.querySelector('[data-calc-profit-month]'),paybackNode=document.querySelector('[data-calc-payback]');
    const metrics=miningCalculatorData;
    if(metrics?.status!=='auto'){
      status.textContent='Datos de red no disponibles';
      [grossNode,energyNode,powerNode,profitNode,monthNode,paybackNode].filter(Boolean).forEach((node)=>node.textContent='No disponible');
      return;
    }
    const country=root.querySelector('[data-calc-country]'),electricityInput=root.querySelector('[data-calc-electricity]'),hardwareSelect=root.querySelector('[data-calc-hardware]');
    const isManual=country?.value==='manual';
    electricityInput.disabled=!isManual;
    const equipment=miningEquipment(metrics,hardwareSelect?.value);
    const uptime=Math.min(100,Math.max(0,Number(root.querySelector('[data-calc-uptime]').value)||0));
    const pool=Math.min(100,Math.max(0,Number(root.querySelector('[data-calc-pool]').value)||0));
    const cooling=Math.max(0,Number(root.querySelector('[data-calc-cooling]').value)||0);
    const gross=Number(equipment?.gross_usd_day)*uptime/100*(1-pool/100);
    const energy=Number(equipment?.power_w)/1000*24*uptime/100*(1+cooling/100);
    grossNode.textContent=Number.isFinite(gross)?PRICE.format(gross):'No disponible';
    energyNode.textContent=Number.isFinite(energy)?`${energy.toLocaleString('es-ES',{maximumFractionDigits:2})} kWh`:'No disponible';
    status.textContent=`mempool.space · Kaufman Reference Price · ${equipment?.source||'fabricante'}`;
    const electricityRaw=electricityInput.value.trim();
    if(!isManual||electricityRaw===''){
      powerNode.textContent='Introduce tu tarifa';profitNode.textContent='—';if(monthNode)monthNode.textContent='—';paybackNode.textContent='Introduce coste';return;
    }
    const electricity=Number(electricityRaw);
    if(!Number.isFinite(electricity)||electricity<0){powerNode.textContent='Tarifa no válida';profitNode.textContent='—';if(monthNode)monthNode.textContent='—';paybackNode.textContent='—';return}
    const powerCost=energy*electricity,profit=gross-powerCost;
    powerNode.textContent=PRICE.format(powerCost);
    profitNode.textContent=PRICE.format(profit);
    profitNode.classList.toggle('positive',profit>=0);profitNode.classList.toggle('negative',profit<0);
    if(monthNode){monthNode.textContent=PRICE.format(profit*30);monthNode.classList.toggle('positive',profit>=0);monthNode.classList.toggle('negative',profit<0)}
    const hardwareRaw=root.querySelector('[data-calc-hardware-cost]').value.trim();
    if(hardwareRaw==='')paybackNode.textContent='Introduce coste';
    else{
      const hardwareCost=Number(hardwareRaw);
      paybackNode.textContent=Number.isFinite(hardwareCost)&&hardwareCost>=0&&profit>0?`${Math.ceil(hardwareCost/profit).toLocaleString('es-ES')} días`:'No recuperable con estos costes';
    }
    miningSensitivityMarkup(gross,energy,equipment);
  }

  function miningHashrateChartMarkup(metrics,days){
    const all=(metrics?.hashrate_history||[]).filter((row)=>Number.isFinite(Number(row.timestamp))&&Number.isFinite(Number(row.hashrate_eh_s))).sort((a,b)=>a.timestamp-b.timestamp);
    const rows=all.slice(-days);
    if(rows.length<2)return '<div class="kf-live-empty">Serie insuficiente para este periodo.</div>';
    const width=980,height=310,left=70,right=20,top=24,bottom=48,values=rows.map((row)=>Number(row.hashrate_eh_s)),rawMin=Math.min(...values),rawMax=Math.max(...values),pad=Math.max(5,(rawMax-rawMin)*.12),min=rawMin-pad,max=rawMax+pad,span=max-min;
    const x=(index)=>left+index*(width-left-right)/(rows.length-1),y=(value)=>top+(max-value)*(height-top-bottom)/span;
    const points=rows.map((row,index)=>`${x(index).toFixed(1)},${y(Number(row.hashrate_eh_s)).toFixed(1)}`).join(' ');
    const guides=[0,.25,.5,.75,1].map((ratio)=>{const value=max-span*ratio,py=y(value);return `<line x1="${left}" x2="${width-right}" y1="${py}" y2="${py}"/><text x="${left-10}" y="${py+4}" text-anchor="end">${value.toFixed(0)}</text>`}).join('');
    const tickIndexes=[0,Math.floor((rows.length-1)/2),rows.length-1];
    const ticks=tickIndexes.map((index)=>`<text class="date" x="${x(index)}" y="${height-17}" text-anchor="${index===0?'start':index===rows.length-1?'end':'middle'}">${new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short'}).format(new Date(Number(rows[index].timestamp)*1000)).replace('.','')}</text>`).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Hashrate medio diario de Bitcoin durante los últimos ${days} días"><g class="grid">${guides}</g><polyline class="line" points="${points}"/><circle class="latest" cx="${x(rows.length-1)}" cy="${y(values.at(-1))}" r="5"/><g class="ticks">${ticks}</g></svg>`;
  }

  function renderMiningDashboardLegacy(metrics){
    const dashboard=document.querySelector('[data-mining-dashboard]');
    if(!dashboard)return;
    const valid=metrics?.status==='auto';
    const observed=document.querySelector('[data-mining-observed]');
    if(observed)observed.textContent=valid&&metrics.observed_at?`Red observada ${ageLabel(ageMs(metrics.observed_at))} · precio BTC se refresca desde Kaufman Reference Price`:'Snapshot minero no disponible';
    const heroObserved=document.querySelector('[data-mining-hero-observed]');
    if(heroObserved)heroObserved.textContent=valid&&metrics.observed_at?ageLabel(ageMs(metrics.observed_at)):'No disponible';
    const set=(key,value)=>{const node=document.querySelector(`[data-mining-kpi="${key}"]`);if(node)node.textContent=value};
    if(!valid){['hashprice','hashrate','difficulty','fee-share','block-time','break-even'].forEach((key)=>set(key,'No disponible'));return}
    set('hashprice',`${Number(metrics.hashprice_usd_ph_day).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} US$`);
    set('hashrate',`${Number(metrics.network_hashrate_eh_s).toLocaleString('es-ES',{maximumFractionDigits:1})} EH/s`);
    set('difficulty',`${Number(metrics.next_difficulty_change_pct)>=0?'+':''}${Number(metrics.next_difficulty_change_pct).toLocaleString('es-ES',{maximumFractionDigits:2})} %`);
    set('fee-share',`${Number(metrics.fee_share_pct).toLocaleString('es-ES',{maximumFractionDigits:2})} %`);
    set('block-time',`${Number(metrics.block_interval_minutes).toLocaleString('es-ES',{maximumFractionDigits:2})} min`);
    set('break-even',`${Number(metrics.break_even_usd_kwh).toLocaleString('es-ES',{minimumFractionDigits:3,maximumFractionDigits:3})} US$/kWh`);
    const hashNote=document.querySelector('[data-mining-kpi-note="hashrate"]');
    if(hashNote)hashNote.textContent=`7 d ${Number(metrics.hashrate_change_7d_pct)>=0?'+':''}${Number(metrics.hashrate_change_7d_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} % · 30 d ${Number(metrics.hashrate_change_30d_pct)>=0?'+':''}${Number(metrics.hashrate_change_30d_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} %`;
    const difficultyNote=document.querySelector('[data-mining-kpi-note="difficulty"]');
    if(difficultyNote)difficultyNote.textContent=`Bloque ${Number(metrics.next_difficulty_height).toLocaleString('es-ES')} · ${new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short'}).format(new Date(metrics.next_difficulty_at)).replace('.','')}`;
    const chart=document.querySelector('[data-mining-hashrate-chart]');
    if(chart)chart.innerHTML=miningHashrateChartMarkup(metrics,miningChartRange);
    document.querySelectorAll('[data-mining-range]').forEach((button)=>button.setAttribute('aria-pressed',String(Number(button.dataset.miningRange)===miningChartRange)));
    const summary=document.querySelector('[data-mining-chart-summary]');
    if(summary)summary.textContent=`${Number(metrics.network_hashrate_eh_s).toLocaleString('es-ES',{maximumFractionDigits:1})} EH/s actuales`;
    const decisions=document.querySelector('[data-mining-decisions]');
    if(decisions){
      const difficulty=Number(metrics.next_difficulty_change_pct),top2=Number(metrics.pool_top_2_share_pct),fees=Number(metrics.fee_share_pct),breakEven=Number(metrics.break_even_usd_kwh);
      decisions.innerHTML=`<header><span>Lectura operativa</span><strong>Qué puede mover tu margen</strong></header><ol><li><b>${difficulty>=0?'Más':'Menos'} dificultad estimada</b><span>${difficulty>=0?'Presiona el ingreso por TH/s si precio y comisiones no compensan.':'Eleva el ingreso por TH/s si el resto permanece igual.'}</span></li><li><b>${top2.toLocaleString('es-ES',{maximumFractionDigits:1})} % en los dos primeros pools</b><span>No mide propiedad del hashrate, pero sí concentración de bloques atribuidos en 7 días.</span></li><li><b>Solo ${fees.toLocaleString('es-ES',{maximumFractionDigits:2})} % procede de comisiones</b><span>Con comisiones bajas, la economía depende casi por completo del subsidio y del precio.</span></li><li><b>${breakEven.toLocaleString('es-ES',{minimumFractionDigits:3,maximumFractionDigits:3})} US$/kWh es el techo teórico</b><span>Tu tarifa sostenible debe ser menor para absorber pool, refrigeración, fallos y capital.</span></li></ol>`;
    }
    const hardwareTable=document.querySelector('[data-mining-hardware-table]');
    if(hardwareTable)hardwareTable.innerHTML=(metrics.hardware_comparison||[]).map((row)=>`<tr><td><strong>${escapeHtml(row.model)}</strong></td><td>${escapeHtml(row.cooling)}</td><td class="number">${Number(row.hashrate_th_s).toLocaleString('es-ES')} TH/s</td><td class="number">${Number(row.power_w).toLocaleString('es-ES')} W</td><td class="number">${Number(row.efficiency_j_th).toLocaleString('es-ES',{maximumFractionDigits:1})} J/TH</td><td class="number">${PRICE.format(Number(row.gross_usd_day))}</td><td class="number">${Number(row.break_even_usd_kwh).toLocaleString('es-ES',{minimumFractionDigits:3,maximumFractionDigits:3})} US$/kWh</td><td><a href="${safeExternalUrl(row.source_url)}" target="_blank" rel="noopener noreferrer">BITMAIN ↗</a></td></tr>`).join('');
    const poolRows=(metrics.pools||[]).slice(0,6),poolChart=document.querySelector('[data-mining-pool-chart]');
    if(poolChart)poolChart.innerHTML=`<header><span>Cuota de bloques</span><strong>${Number(metrics.pool_blocks).toLocaleString('es-ES')} bloques · 7 días</strong></header><div>${poolRows.map((row)=>`<article><span>${escapeHtml(row.name)}</span><i><b style="width:${Math.min(100,Number(row.share_pct))}%"></b></i><strong>${Number(row.share_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} %</strong></article>`).join('')}</div><small>Los demás pools completan el 100 %.</small>`;
    const poolTable=document.querySelector('[data-mining-pool-table]');
    if(poolTable)poolTable.innerHTML=`<header><span>Concentración</span><strong>Ventana móvil de 7 días</strong></header><dl><div><dt>Dos mayores</dt><dd>${Number(metrics.pool_top_2_share_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} %</dd></div><div><dt>Cinco mayores</dt><dd>${Number(metrics.pool_top_5_share_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} %</dd></div><div><dt>HHI de bloques</dt><dd>${Number(metrics.pool_hhi).toLocaleString('es-ES',{maximumFractionDigits:0})}</dd></div><div><dt>Bloques vacíos · top 6</dt><dd>${poolRows.reduce((total,row)=>total+Number(row.empty_blocks||0),0).toLocaleString('es-ES')}</dd></div></dl><p>HHI: suma de las cuotas al cuadrado. Es una señal comparativa de concentración, no una prueba de control coordinado.</p>`;
    const screen=metrics.country_screen,countryContext=document.querySelector('[data-mining-country-context]'),countries=document.querySelector('[data-mining-countries]');
    if(screen?.status==='auto'&&screen.top_three?.length===3){
      const eurostatSource=screen.sources?.find((source)=>/eurostat/i.test(source.name||''));
      const ecbSource=screen.sources?.find((source)=>/central|bce|ecb/i.test(source.name||''));
      if(countryContext)countryContext.innerHTML=`<span>${escapeHtml(screen.benchmark)}</span><strong>${escapeHtml(screen.source_period)} · ${Number(screen.coverage_count).toLocaleString('es-ES')} países · comprobación automática diaria</strong><nav>${eurostatSource?`<a href="${safeExternalUrl(eurostatSource.url)}" target="_blank" rel="noopener noreferrer">Eurostat ↗</a>`:''}${ecbSource?`<a href="${safeExternalUrl(ecbSource.url)}" target="_blank" rel="noopener noreferrer">BCE ↗</a>`:''}</nav>`;
      if(countries)countries.innerHTML=screen.top_three.map((row,index)=>`<article><header><span>0${index+1}</span><div><strong>${escapeHtml(row.country)}</strong><small>${Number(row.electricity_eur_kwh).toLocaleString('es-ES',{minimumFractionDigits:4,maximumFractionDigits:4})} €/kWh</small></div></header><p><strong>Por qué aparece:</strong> ${index===0?'menor':`${index+1}.ª menor`} tarifa industrial comparable entre ${Number(screen.coverage_count).toLocaleString('es-ES')} países observados.</p><dl><div><dt>Electricidad / día</dt><dd>${PRICE.format(Number(row.electricity_usd_day))}</dd></div><div><dt>Resultado S21 XP / día</dt><dd class="${Number(row.modeled_net_usd_day)>=0?'positive':'negative'}">${PRICE.format(Number(row.modeled_net_usd_day))}</dd></div><div><dt>Margen antes de otros costes</dt><dd class="${Number(row.modeled_margin_pct)>=0?'positive':'negative'}">${Number(row.modeled_margin_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} %</dd></div></dl><p><strong>Antes de decidir:</strong> ${escapeHtml(row.check)}</p></article>`).join('');
    }else{
      if(countryContext)countryContext.textContent='Fuente internacional temporalmente no disponible.';
      if(countries)countries.innerHTML='<div class="kf-live-empty">No se publica un top 3 sin tres observaciones comparables.</div>';
    }
    drawMiningCalculator();
  }

  let latestMiningCalculation=null;

  function miningInputNumber(root,selector,fallback=0){
    const value=Number(root.querySelector(selector)?.value);
    return Number.isFinite(value)?value:fallback;
  }

  function miningScenarioInputs(root){
    return {
      hardware:root.querySelector('[data-calc-hardware]')?.value||'',
      units:Math.max(1,Math.round(miningInputNumber(root,'[data-calc-units]',1))),
      electricity:Math.max(0,miningInputNumber(root,'[data-calc-electricity]',0)),
      demand:Math.max(0,miningInputNumber(root,'[data-calc-demand]',0)),
      pue:Math.max(1,miningInputNumber(root,'[data-calc-pue]',1)),
      uptime:Math.min(100,Math.max(0,miningInputNumber(root,'[data-calc-uptime]',0))),
      curtailment:Math.min(720,Math.max(0,miningInputNumber(root,'[data-calc-curtailment]',0))),
      pool:Math.min(100,Math.max(0,miningInputNumber(root,'[data-calc-pool]',0))),
      maintenance:Math.max(0,miningInputNumber(root,'[data-calc-maintenance]',0)),
      finance:Math.max(0,miningInputNumber(root,'[data-calc-finance]',0)),
      other:Math.max(0,miningInputNumber(root,'[data-calc-other]',0)),
      hardwareCost:Math.max(0,miningInputNumber(root,'[data-calc-hardware-cost]',0)),
      logistics:Math.max(0,miningInputNumber(root,'[data-calc-logistics]',0))
    };
  }

  function setMiningInputs(root,values){
    const fields={
      hardware:'[data-calc-hardware]',units:'[data-calc-units]',electricity:'[data-calc-electricity]',
      demand:'[data-calc-demand]',pue:'[data-calc-pue]',uptime:'[data-calc-uptime]',
      curtailment:'[data-calc-curtailment]',pool:'[data-calc-pool]',maintenance:'[data-calc-maintenance]',
      finance:'[data-calc-finance]',other:'[data-calc-other]',hardwareCost:'[data-calc-hardware-cost]',
      logistics:'[data-calc-logistics]'
    };
    Object.entries(fields).forEach(([key,selector])=>{const node=root.querySelector(selector);if(node&&values[key]!==undefined&&values[key]!==null)node.value=String(values[key])});
  }

  function miningAllInSensitivityMarkup(gross,fleetEnergy,fixedDaily,demand,equipment){
    const root=document.querySelector('[data-mining-sensitivity-chart]');
    if(!root||![gross,fleetEnergy,fixedDaily,demand].every(Number.isFinite))return;
    const costs=[.03,.05,.07,.09,.11,.13,.15];
    const rows=costs.map((cost)=>({cost,profit:gross-fleetEnergy*(cost+demand)-fixedDaily}));
    const width=900,height=250,left=64,right=22,top=24,bottom=48,values=[0].concat(rows.map((row)=>row.profit)),min=Math.min.apply(null,values),max=Math.max.apply(null,values),span=Math.max(.01,max-min);
    const x=(index)=>left+index*(width-left-right)/(rows.length-1);
    const y=(value)=>top+(max-value)*(height-top-bottom)/span;
    const zero=y(0),points=rows.map((row,index)=>x(index).toFixed(1)+','+y(row.profit).toFixed(1)).join(' ');
    root.innerHTML='<svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Resultado diario all-in de '+escapeHtml(equipment?.model||'la flota')+' para tarifas eléctricas entre 0,03 y 0,15 dólares por kWh"><line class="zero" x1="'+left+'" x2="'+(width-right)+'" y1="'+zero+'" y2="'+zero+'"/><polyline points="'+points+'"/><g>'+rows.map((row,index)=>'<circle cx="'+x(index)+'" cy="'+y(row.profit)+'" r="4"/><text x="'+x(index)+'" y="'+(height-19)+'" text-anchor="middle">'+row.cost.toFixed(2)+'</text><text class="value" x="'+x(index)+'" y="'+Math.max(14,y(row.profit)-11)+'" text-anchor="middle">'+row.profit.toLocaleString('es-ES',{minimumFractionDigits:0,maximumFractionDigits:0})+'</text>').join('')+'</g><text class="axis" x="'+left+'" y="'+(height-3)+'">US$/kWh</text></svg>';
    const title=document.querySelector('[data-mining-sensitivity-title]');
    if(title)title.textContent=(equipment?.model||'Flota')+' · resultado diario';
  }

  function miningScenarioMatrixMarkup(calculation){
    const root=document.querySelector('[data-mining-scenario-matrix]');
    if(!root||!calculation)return;
    const prices=[['−30 %',.7],['Base',1],['+30 %',1.3]];
    const difficulties=[['−20 %',.8],['Base',1],['+20 %',1.2]];
    const cells=['<div class="axis corner">Dificultad \\ Precio</div>'].concat(prices.map((item)=>'<div class="axis">'+item[0]+'</div>'));
    difficulties.forEach((difficulty)=>{
      cells.push('<div class="axis row">'+difficulty[0]+'</div>');
      prices.forEach((price)=>{
        const monthly=(calculation.grossDay*price[1]/difficulty[1]-calculation.operatingCostDay)*30;
        const tone=monthly>=0?'positive':'negative';
        cells.push('<div class="'+tone+'"><strong>'+PRICE.format(monthly)+'</strong><span>/ mes</span></div>');
      });
    });
    root.innerHTML=cells.join('');
  }

  function drawMiningCalculator(){
    const root=document.querySelector('[data-mining-calculator]');
    if(!root)return;
    const metrics=miningCalculatorData,status=root.querySelector('[data-calc-status]');
    const outputSelectors=['[data-calc-fleet-hashrate]','[data-calc-fleet-load]','[data-calc-btc-month]','[data-calc-gross]','[data-calc-allin-cost]','[data-calc-profit]','[data-calc-profit-month]','[data-calc-cost-btc]','[data-calc-btc-breakeven]','[data-calc-difficulty-headroom]','[data-calc-capex]','[data-calc-payback]'];
    if(metrics?.status!=='auto'){
      if(status)status.textContent='Datos de red no disponibles';
      outputSelectors.forEach((selector)=>{const node=document.querySelector(selector);if(node)node.textContent='No disponible'});
      return;
    }
    const values=miningScenarioInputs(root),equipment=miningEquipment(metrics,values.hardware);
    if(!equipment)return;
    const availability=values.uptime/100;
    const curtailmentFactor=Math.max(0,1-values.curtailment/720);
    const productionFactor=availability*curtailmentFactor;
    const grossPerUnit=Number(equipment.gross_usd_day)*productionFactor*(1-values.pool/100);
    const baseBtcPerUnit=Number(metrics.gross_btc_day)*(Number(equipment.hashrate_th_s)/Number(metrics.hardware.hashrate_th_s))*productionFactor*(1-values.pool/100);
    const grossDay=grossPerUnit*values.units;
    const btcDay=baseBtcPerUnit*values.units;
    const asicEnergyDay=Number(equipment.power_w)/1000*24*productionFactor*values.units;
    const facilityEnergyDay=asicEnergyDay*values.pue;
    const energyCostDay=facilityEnergyDay*(values.electricity+values.demand);
    const fixedDaily=(values.maintenance*values.units+values.finance+values.other)/30;
    const operatingCostDay=energyCostDay+fixedDaily;
    const profitDay=grossDay-operatingCostDay;
    const capex=values.units*(values.hardwareCost+values.logistics);
    const costBtc=btcDay>0?operatingCostDay/btcDay:null;
    const electricityBreakeven=facilityEnergyDay>0?(grossDay-facilityEnergyDay*values.demand-fixedDaily)/facilityEnergyDay:null;
    const difficultyHeadroom=operatingCostDay>0?(grossDay/operatingCostDay-1)*100:null;
    const payback=profitDay>0&&capex>0?capex/profitDay:null;
    const nodes={
      '[data-calc-model-name]':equipment.manufacturer+' · '+equipment.model,
      '[data-calc-fleet-hashrate]':values.units>=1000?(Number(equipment.hashrate_th_s)*values.units/1e6).toLocaleString('es-ES',{maximumFractionDigits:3})+' EH/s':(Number(equipment.hashrate_th_s)*values.units/1000).toLocaleString('es-ES',{maximumFractionDigits:3})+' PH/s',
      '[data-calc-fleet-load]':(Number(equipment.power_w)*values.units*values.pue/1e6).toLocaleString('es-ES',{maximumFractionDigits:3})+' MW',
      '[data-calc-btc-month]':(btcDay*30).toLocaleString('es-ES',{minimumFractionDigits:4,maximumFractionDigits:4})+' BTC',
      '[data-calc-gross]':PRICE.format(grossDay),
      '[data-calc-allin-cost]':PRICE.format(operatingCostDay),
      '[data-calc-profit]':PRICE.format(profitDay),
      '[data-calc-profit-month]':PRICE.format(profitDay*30),
      '[data-calc-cost-btc]':Number.isFinite(costBtc)?PRICE.format(costBtc):'No disponible',
      '[data-calc-btc-breakeven]':Number.isFinite(electricityBreakeven)?electricityBreakeven.toLocaleString('es-ES',{minimumFractionDigits:3,maximumFractionDigits:3})+' US$/kWh':'No disponible',
      '[data-calc-difficulty-headroom]':Number.isFinite(difficultyHeadroom)?(difficultyHeadroom>=0?'+':'')+difficultyHeadroom.toLocaleString('es-ES',{maximumFractionDigits:1})+' %':'No disponible',
      '[data-calc-capex]':PRICE.format(capex),
      '[data-calc-payback]':Number.isFinite(payback)?Math.ceil(payback).toLocaleString('es-ES')+' días':'No recuperable'
    };
    Object.entries(nodes).forEach(([selector,value])=>{const node=document.querySelector(selector);if(node)node.textContent=value});
    ['[data-calc-profit]','[data-calc-profit-month]'].forEach((selector)=>{const node=document.querySelector(selector);if(node){node.classList.toggle('positive',profitDay>=0);node.classList.toggle('negative',profitDay<0)}});
    if(status)status.textContent='Red: mempool.space · precio: Kaufman · equipo: '+equipment.source;
    latestMiningCalculation={values,equipment,grossDay,btcDay,facilityEnergyDay,energyCostDay,fixedDaily,operatingCostDay,profitDay,capex,costBtc,electricityBreakeven,difficultyHeadroom,payback};
    miningScenarioMatrixMarkup(latestMiningCalculation);
    miningAllInSensitivityMarkup(grossDay,facilityEnergyDay,fixedDaily,values.demand,equipment);
    renderMiningAlerts();
  }

  function renderMiningCountries(){
    const metrics=miningCalculatorData,screen=metrics?.country_screen,body=document.querySelector('[data-mining-countries]');
    if(!body)return;
    if(screen?.status!=='auto'||!Array.isArray(screen.all_observations)){
      body.innerHTML='<tr><td colspan="6">La fuente internacional no está disponible.</td></tr>';
      const expand=document.querySelector('[data-mining-country-expand]');if(expand)expand.hidden=true;
      return;
    }
    const search=(document.querySelector('[data-mining-country-search]')?.value||'').trim().toLocaleLowerCase('es');
    const profitFilter=document.querySelector('[data-mining-country-profit]')?.value||'all';
    const reference=(metrics.hardware_comparison||[]).find((row)=>row.id==='s21-xp')||metrics.hardware;
    const matches=screen.all_observations.map((row)=>{
      const gross=Number(reference?.gross_usd_day),cost=Number(reference?.energy_kwh_day)*Number(row.electricity_usd_kwh),profit=gross-cost;
      return {...row,modeledProfit:profit};
    }).filter((row)=>{
      const matchesSearch=!search||String(row.country).toLocaleLowerCase('es').includes(search);
      const profitMatches=profitFilter==='all'||(profitFilter==='positive'?row.modeledProfit>=0:row.modeledProfit<0);
      return matchesSearch&&profitMatches;
    });
    const rows=!search&&profitFilter==='all'&&!miningCountriesExpanded?matches.slice(0,5):matches;
    body.innerHTML=rows.map((row)=>'<tr><td><strong>'+escapeHtml(row.country)+'</strong></td><td>'+escapeHtml(row.period||screen.source_period)+'</td><td class="number">'+Number(row.electricity_eur_kwh).toLocaleString('es-ES',{minimumFractionDigits:4,maximumFractionDigits:4})+'</td><td class="number">'+Number(row.electricity_usd_kwh).toLocaleString('es-ES',{minimumFractionDigits:4,maximumFractionDigits:4})+'</td><td class="number '+(row.modeledProfit>=0?'positive':'negative')+'">'+PRICE.format(row.modeledProfit)+'</td><td>'+escapeHtml(row.check)+'</td></tr>').join('')||'<tr><td colspan="6">No hay países que coincidan con el filtro.</td></tr>';
    const count=document.querySelector('[data-mining-country-count]');
    if(count)count.textContent=rows.length.toLocaleString('es-ES')+' visibles de '+screen.all_observations.length.toLocaleString('es-ES')+' países';
    const expand=document.querySelector('[data-mining-country-expand]');
    if(expand){
      expand.hidden=Boolean(search)||profitFilter!=='all';
      expand.setAttribute('aria-expanded',String(miningCountriesExpanded));
      expand.textContent=miningCountriesExpanded?'Ver solo 5 países':`Ver los ${screen.all_observations.length.toLocaleString('es-ES')} países`;
    }
  }

  function renderMiningAlerts(){
    const root=document.querySelector('[data-mining-alert-results]');
    if(!root||!latestMiningCalculation||!miningCalculatorData)return;
    const hashpriceMin=Number(document.querySelector('[data-alert-hashprice-min]')?.value);
    const electricityMax=Number(document.querySelector('[data-alert-electricity-max]')?.value);
    const marginMin=Number(document.querySelector('[data-alert-margin-min]')?.value);
    const actualHashprice=Number(miningCalculatorData.hashprice_usd_ph_day);
    const actualElectricity=latestMiningCalculation.values.electricity+latestMiningCalculation.values.demand;
    const actualMargin=latestMiningCalculation.profitDay*30;
    const rows=[
      ['Hashprice',actualHashprice>=hashpriceMin,actualHashprice.toLocaleString('es-ES',{maximumFractionDigits:2})+' frente a mínimo '+hashpriceMin.toLocaleString('es-ES')],
      ['Energía contratada',actualElectricity<=electricityMax,actualElectricity.toLocaleString('es-ES',{minimumFractionDigits:3,maximumFractionDigits:3})+' frente a máximo '+electricityMax.toLocaleString('es-ES')],
      ['Margen mensual',actualMargin>=marginMin,PRICE.format(actualMargin)+' frente a mínimo '+PRICE.format(marginMin)]
    ];
    root.innerHTML=rows.map((row)=>'<span class="'+(row[1]?'ok':'breach')+'"><i></i><strong>'+row[0]+'</strong>'+row[2]+'</span>').join('');
  }

  function renderMiningDashboard(metrics){
    const dashboard=document.querySelector('[data-mining-dashboard]');
    if(!dashboard)return;
    const valid=metrics?.status==='auto',observed=document.querySelector('[data-mining-observed]'),heroObserved=document.querySelector('[data-mining-hero-observed]');
    const networkAge=valid&&metrics.observed_at?ageLabel(ageMs(metrics.observed_at)):'No disponible';
    if(observed)observed.textContent=valid?'Red observada '+networkAge+' · objetivo de actualización 30 minutos':'Snapshot minero no disponible';
    if(heroObserved)heroObserved.textContent=valid?networkAge+' · objetivo 30 min':'No disponible';
    const reference=latestMarketSnapshot?.reference_prices?.bitcoin;
    const priceTimestamp=reference?.provider_timestamp||reference?.received_at;
    const priceAge=priceTimestamp?ageLabel(ageMs(priceTimestamp)):(valid&&metrics.observed_at?ageLabel(ageMs(metrics.observed_at))+' · snapshot minero':'No disponible');
    const screen=metrics?.country_screen;
    const freshValues={price:priceAge,network:networkAge,pools:networkAge,countries:screen?.source_period||'No disponible'};
    Object.entries(freshValues).forEach(([key,value])=>{const node=document.querySelector('[data-mining-freshness="'+key+'"]');if(node)node.textContent=value});
    const heroElectricity=document.querySelector('[data-mining-hero-electricity]');
    if(heroElectricity)heroElectricity.textContent=screen?.source_period?screen.source_period+' · publicación semestral':'No disponible';
    const set=(key,value)=>{const node=document.querySelector('[data-mining-kpi="'+key+'"]');if(node)node.textContent=value};
    if(!valid){['hashprice','hashrate','difficulty','fee-share','block-time','break-even'].forEach((key)=>set(key,'No disponible'));return}
    set('hashprice',Number(metrics.hashprice_usd_ph_day).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' US$');
    set('hashrate',Number(metrics.network_hashrate_eh_s).toLocaleString('es-ES',{maximumFractionDigits:1})+' EH/s');
    set('difficulty',(Number(metrics.next_difficulty_change_pct)>=0?'+':'')+Number(metrics.next_difficulty_change_pct).toLocaleString('es-ES',{maximumFractionDigits:2})+' %');
    set('fee-share',Number(metrics.fee_share_pct).toLocaleString('es-ES',{maximumFractionDigits:2})+' %');
    set('block-time',Number(metrics.block_interval_minutes).toLocaleString('es-ES',{maximumFractionDigits:2})+' min');
    set('break-even',Number(metrics.break_even_usd_kwh).toLocaleString('es-ES',{minimumFractionDigits:3,maximumFractionDigits:3})+' US$/kWh');
    const hashNote=document.querySelector('[data-mining-kpi-note="hashrate"]');
    if(hashNote)hashNote.textContent='7 d '+(Number(metrics.hashrate_change_7d_pct)>=0?'+':'')+Number(metrics.hashrate_change_7d_pct).toLocaleString('es-ES',{maximumFractionDigits:1})+' % · 30 d '+(Number(metrics.hashrate_change_30d_pct)>=0?'+':'')+Number(metrics.hashrate_change_30d_pct).toLocaleString('es-ES',{maximumFractionDigits:1})+' %';
    const difficultyNote=document.querySelector('[data-mining-kpi-note="difficulty"]');
    if(difficultyNote)difficultyNote.textContent='Bloque '+Number(metrics.next_difficulty_height).toLocaleString('es-ES')+' · '+new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short'}).format(new Date(metrics.next_difficulty_at)).replace('.','');
    const chart=document.querySelector('[data-mining-hashrate-chart]');
    if(chart)chart.innerHTML=miningHashrateChartMarkup(metrics,miningChartRange);
    document.querySelectorAll('[data-mining-range]').forEach((button)=>button.setAttribute('aria-pressed',String(Number(button.dataset.miningRange)===miningChartRange)));
    const summary=document.querySelector('[data-mining-chart-summary]');
    if(summary)summary.textContent=Number(metrics.network_hashrate_eh_s).toLocaleString('es-ES',{maximumFractionDigits:1})+' EH/s · '+miningChartRange+' días';
    const decisions=document.querySelector('[data-mining-decisions]');
    if(decisions){
      const difficulty=Number(metrics.next_difficulty_change_pct),fees=Number(metrics.fee_share_pct),hashprice=Number(metrics.hashprice_usd_ph_day),blockTime=Number(metrics.block_interval_minutes);
      decisions.innerHTML='<header><span>Lectura operativa</span><strong>Qué cambia la cuenta</strong></header><ol><li><b>'+hashprice.toLocaleString('es-ES',{maximumFractionDigits:2})+' US$/PH/día de ingreso bruto</b><span>Es la referencia comparable antes de energía, pool, PUE y costes de instalación.</span></li><li><b>'+(difficulty>=0?'Subida':'Bajada')+' estimada de dificultad</b><span>'+(difficulty>=0?'Reduce':'Aumenta')+' el ingreso por TH/s si precio y comisiones permanecen iguales.</span></li><li><b>'+fees.toLocaleString('es-ES',{maximumFractionDigits:2})+' % de la recompensa son fees</b><span>Mide cuánto ingreso depende del mercado de espacio de bloque frente al subsidio.</span></li><li><b>'+blockTime.toLocaleString('es-ES',{maximumFractionDigits:2})+' minutos por bloque</b><span>Un ritmo distinto de diez minutos altera temporalmente la producción diaria observada.</span></li></ol>';
    }
    const hardwareSelect=document.querySelector('[data-calc-hardware]');
    if(hardwareSelect){
      const previous=hardwareSelect.value;
      hardwareSelect.innerHTML=(metrics.hardware_comparison||[]).map((row)=>'<option value="'+escapeHtml(row.id)+'">'+escapeHtml(row.manufacturer+' · '+row.model+' · '+row.cooling)+'</option>').join('');
      const pending=document.querySelector('[data-mining-calculator]')?.dataset.pendingHardware;
      const requested=pending||previous;
      if((metrics.hardware_comparison||[]).some((row)=>row.id===requested))hardwareSelect.value=requested;
      const calculator=document.querySelector('[data-mining-calculator]');if(calculator)delete calculator.dataset.pendingHardware;
    }
    const hardwareTable=document.querySelector('[data-mining-hardware-table]');
    if(hardwareTable)hardwareTable.innerHTML=(metrics.hardware_comparison||[]).map((row)=>'<tr><td><span>'+escapeHtml(row.manufacturer)+'</span><strong>'+escapeHtml(row.model)+'</strong></td><td>'+escapeHtml(row.cooling)+'</td><td class="number">'+Number(row.hashrate_th_s).toLocaleString('es-ES')+' TH/s</td><td class="number">'+Number(row.power_w).toLocaleString('es-ES')+' W</td><td class="number">'+Number(row.efficiency_j_th).toLocaleString('es-ES',{maximumFractionDigits:1})+' J/TH</td><td><strong>'+escapeHtml(row.operating_temperature||'Consultar ficha')+'</strong><small>'+escapeHtml(row.tolerance||row.spec_basis||'')+'</small></td><td class="number">'+PRICE.format(Number(row.gross_usd_day))+'</td><td class="number">'+Number(row.break_even_usd_kwh).toLocaleString('es-ES',{minimumFractionDigits:3,maximumFractionDigits:3})+' US$/kWh</td><td><a href="'+safeExternalUrl(row.source_url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(row.source)+' ↗</a></td></tr>').join('');
    const poolRows=(metrics.pools||[]).slice(0,6),poolChart=document.querySelector('[data-mining-pool-chart]');
    if(poolChart)poolChart.innerHTML='<header><span>Cuota de bloques</span><strong>'+Number(metrics.pool_blocks).toLocaleString('es-ES')+' bloques · 7 días</strong></header><div>'+poolRows.map((row)=>'<article><span>'+escapeHtml(row.name)+'</span><i><b style="width:'+Math.min(100,Number(row.share_pct))+'%"></b></i><strong>'+Number(row.share_pct).toLocaleString('es-ES',{maximumFractionDigits:1})+' %</strong></article>').join('')+'</div><small>La cuota observada no incorpora comisión, método de pago, latencia ni varianza del minero.</small>';
    const poolTable=document.querySelector('[data-mining-pool-table]');
    if(poolTable)poolTable.innerHTML='<header><span>Condiciones publicadas</span><strong>Verificar antes de conectar</strong></header><div class="kf-pool-terms">'+(metrics.pool_terms||[]).map((row)=>'<article><div><strong>'+escapeHtml(row.name)+'</strong><span>'+escapeHtml(row.payout_scheme)+'</span></div><dl><div><dt>Comisión</dt><dd>'+escapeHtml(row.pool_fee)+'</dd></div><div><dt>Mínimo</dt><dd>'+escapeHtml(row.minimum_payout)+'</dd></div><div><dt>Pago</dt><dd>'+escapeHtml(row.payout_timing)+'</dd></div></dl><a href="'+safeExternalUrl(row.source_url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(row.source)+' ↗</a></article>').join('')+'</div><p>Solo se publican términos con una fuente primaria accesible. Los pools sin condiciones comparables permanecen fuera de esta tabla.</p>';
    if(screen?.status==='auto'){
      const eurostatSource=screen.sources?.find((source)=>/eurostat/i.test(source.name||'')),ecbSource=screen.sources?.find((source)=>/central|bce|ecb/i.test(source.name||''));
      const countryContext=document.querySelector('[data-mining-country-context]');
      if(countryContext)countryContext.innerHTML='<span>'+escapeHtml(screen.benchmark)+'</span><strong>Periodo '+escapeHtml(screen.source_period)+' · '+Number(screen.coverage_count).toLocaleString('es-ES')+' países · fuente semestral</strong><nav>'+(eurostatSource?'<a href="'+safeExternalUrl(eurostatSource.url)+'" target="_blank" rel="noopener noreferrer">Eurostat ↗</a>':'')+(ecbSource?'<a href="'+safeExternalUrl(ecbSource.url)+'" target="_blank" rel="noopener noreferrer">BCE ↗</a>':'')+'</nav>';
    }
    renderMiningCountries();
    drawMiningCalculator();
  }

  function syncMiningReference(){
    const reference=latestMarketSnapshot?.reference_prices?.bitcoin;
    const automated=latestMarketSnapshot?.delivery_mode==='AUTOMATED_5_MINUTE_SNAPSHOT';
    const referenceAge=ageMs(reference?.received_at||reference?.provider_timestamp);
    const maxAge=Number(latestMarketSnapshot?.price_max_age_ms||latestMarketSnapshot?.max_age_ms)||(automated?900000:5000);
    const referenceFresh=reference?.price&&(automated?Number.isFinite(referenceAge)&&referenceAge<=maxAge:freshnessFromAge(referenceAge)==='FRESH');
    if(miningCalculatorData?.status==='auto'&&referenceFresh){
      const grossBtc=Number(miningCalculatorData.gross_btc_day),energy=Number(miningCalculatorData.energy_kwh_day),price=Number(reference.price),previousPrice=Number(miningCalculatorData.btc_price_usd);
      if(Number.isFinite(grossBtc)&&Number.isFinite(energy)&&energy>0&&Number.isFinite(price)&&Number.isFinite(previousPrice)&&previousPrice>0){
        const ratio=price/previousPrice,grossUsd=grossBtc*price,hashprice=Number(miningCalculatorData.hashprice_usd_ph_day)*ratio;
        const hardwareComparison=(miningCalculatorData.hardware_comparison||[]).map((row)=>{const gross=Number(row.gross_usd_day)*ratio,energyDay=Number(row.energy_kwh_day);return {...row,gross_usd_day:gross,break_even_usd_kwh:gross/energyDay}});
        const countryScreen=miningCalculatorData.country_screen?.status==='auto'?{...miningCalculatorData.country_screen,top_three:miningCalculatorData.country_screen.top_three.map((row)=>{const net=grossUsd-Number(row.electricity_usd_day);return {...row,modeled_net_usd_day:net,modeled_margin_pct:net/grossUsd*100}}),all_observations:(miningCalculatorData.country_screen.all_observations||[]).map((row)=>{const net=grossUsd-Number(row.electricity_usd_day);return {...row,modeled_net_usd_day:net,modeled_margin_pct:net/grossUsd*100}})}:miningCalculatorData.country_screen;
        miningCalculatorData={...miningCalculatorData,btc_price_usd:price,gross_usd_day:grossUsd,hashprice_usd_ph_day:hashprice,break_even_usd_kwh:grossUsd/energy,hardware_comparison:hardwareComparison,country_screen:countryScreen,price_source:`Kaufman Reference Price · ${automated?'automático':'tiempo real'}`};
        document.querySelectorAll('[data-mining-gross]').forEach((node)=>node.textContent=PRICE.format(grossUsd));
        document.querySelectorAll('[data-mining-break-even]').forEach((node)=>node.textContent=`${SMALL_USD.format(grossUsd/energy)}/kWh`);
        document.querySelectorAll('[data-mining-price-source]').forEach((node)=>node.textContent=page==='home'?'Kaufman Reference Price':`Kaufman Reference Price · ${ageLabel(ageMs(reference.provider_timestamp))}`);
      }
    }
    renderMiningDashboard(miningCalculatorData);
    drawMiningCalculator();
  }

  function updateMiningCalculator(metrics){miningCalculatorData=metrics?{...metrics}:null;syncMiningReference()}

  function initMiningCalculator(){
    const root=document.querySelector('[data-mining-calculator]');
    if(!root)return;
    const query=new URLSearchParams(location.search),shared={};
    const queryFields={hardware:'m_equipo',units:'m_unidades',electricity:'m_energia',demand:'m_hosting',pue:'m_pue',uptime:'m_uptime',curtailment:'m_curtailment',pool:'m_pool',maintenance:'m_mantenimiento',finance:'m_financiacion',other:'m_otros',hardwareCost:'m_asic',logistics:'m_logistica'};
    Object.entries(queryFields).forEach(([key,param])=>{if(query.has(param))shared[key]=query.get(param)});
    let stored=null;
    try{stored=JSON.parse(window.localStorage.getItem('kaufman_mining_scenario')||'null')}catch(error){}
    const initial=Object.keys(shared).length?shared:stored;
    if(initial){
      setMiningInputs(root,initial);
      if(initial.hardware)root.dataset.pendingHardware=initial.hardware;
    }
    try{
      const alerts=JSON.parse(window.localStorage.getItem('kaufman_mining_alerts')||'null');
      if(alerts){
        const fields={hashprice:'[data-alert-hashprice-min]',electricity:'[data-alert-electricity-max]',margin:'[data-alert-margin-min]'};
        Object.entries(fields).forEach(([key,selector])=>{const node=document.querySelector(selector);if(node&&alerts[key]!==undefined)node.value=String(alerts[key])});
      }
    }catch(error){}
    root.addEventListener('input',drawMiningCalculator);
    root.addEventListener('change',drawMiningCalculator);
    document.querySelector('[data-mining-save]')?.addEventListener('click',()=>{
      try{window.localStorage.setItem('kaufman_mining_scenario',JSON.stringify(miningScenarioInputs(root)));const status=document.querySelector('[data-mining-action-status]');if(status)status.textContent='Datos guardados en este navegador.'}catch(error){}
    });
    document.querySelector('[data-mining-share]')?.addEventListener('click',async()=>{
      const url=new URL(location.href),values=miningScenarioInputs(root);
      Object.entries(queryFields).forEach(([key,param])=>url.searchParams.set(param,String(values[key])));
      history.replaceState(null,'',url);
      const status=document.querySelector('[data-mining-action-status]');
      try{await navigator.clipboard.writeText(url.href);if(status)status.textContent='Enlace copiado con todas las entradas.'}catch(error){if(status)status.textContent='El enlace ya contiene todas las entradas; cópialo desde la barra del navegador.'}
    });
    document.querySelector('[data-mining-export]')?.addEventListener('click',()=>{
      if(!latestMiningCalculation)return;
      const c=latestMiningCalculation,rows=[
        ['campo','valor'],['equipo',c.equipment.manufacturer+' '+c.equipment.model],['unidades',c.values.units],
        ['electricidad_usd_kwh',c.values.electricity],['hosting_demanda_usd_kwh',c.values.demand],['pue',c.values.pue],
        ['uptime_pct',c.values.uptime],['curtailment_h_mes',c.values.curtailment],['pool_fee_pct',c.values.pool],
        ['hashrate_th_s_flota',Number(c.equipment.hashrate_th_s)*c.values.units],['energia_kwh_dia',c.facilityEnergyDay],
        ['ingreso_bruto_usd_dia',c.grossDay],['coste_operativo_usd_dia',c.operatingCostDay],['resultado_usd_dia',c.profitDay],
        ['resultado_usd_mes',c.profitDay*30],['coste_operativo_usd_btc',c.costBtc],['electricidad_directa_equilibrio_usd_kwh',c.electricityBreakeven],['capex_usd',c.capex],['payback_dias',c.payback]
      ];
      const csv=rows.map((row)=>row.map((value)=>'"'+String(value??'').replaceAll('"','""')+'"').join(',')).join('\n');
      const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download='kaufman-mineria-operacion.csv';link.click();URL.revokeObjectURL(link.href);
      const status=document.querySelector('[data-mining-action-status]');if(status)status.textContent='CSV exportado con entradas y resultados.';
    });
    document.querySelector('[data-mining-alert-save]')?.addEventListener('click',()=>{
      const alerts={hashprice:miningInputNumber(document,'[data-alert-hashprice-min]',0),electricity:miningInputNumber(document,'[data-alert-electricity-max]',0),margin:miningInputNumber(document,'[data-alert-margin-min]',0)};
      try{window.localStorage.setItem('kaufman_mining_alerts',JSON.stringify(alerts))}catch(error){}
      renderMiningAlerts();
    });
    document.querySelectorAll('[data-alert-hashprice-min],[data-alert-electricity-max],[data-alert-margin-min]').forEach((node)=>node.addEventListener('input',renderMiningAlerts));
    drawMiningCalculator();
  }

  function initMiningDashboard(){
    document.querySelectorAll('[data-mining-range]').forEach((button)=>button.addEventListener('click',()=>{miningChartRange=Number(button.dataset.miningRange)||30;renderMiningDashboard(miningCalculatorData)}));
    document.querySelector('[data-mining-country-search]')?.addEventListener('input',renderMiningCountries);
    document.querySelector('[data-mining-country-profit]')?.addEventListener('change',renderMiningCountries);
    document.querySelector('[data-mining-country-expand]')?.addEventListener('click',()=>{miningCountriesExpanded=!miningCountriesExpanded;renderMiningCountries()});
  }

  function initJurisdictionTool(){
    return;
  }

  function initCountryCostStack(){
    const root=document.querySelector('[data-country-cost]');
    if(!root)return;
    const country=root.querySelector('[data-country-cost-country]'),amount=root.querySelector('[data-country-cost-amount]'),asset=root.querySelector('[data-country-cost-asset]'),context=root.querySelector('[data-country-cost-context]');
    const draw=()=>{
      const option=country.options[country.selectedIndex],countryName=option.text.split('·').slice(1).join('·').trim(),code=option.dataset.code||'—',value=Number(amount.value);
      const amountLabel=Number.isFinite(value)&&value>0?value.toLocaleString('es-ES'):'importe no válido';
      context.textContent=`${code} · ${countryName} · ${amountLabel} · ${asset.value}`;
    };
    root.addEventListener('input',draw);root.addEventListener('change',draw);
    root.querySelectorAll('[data-country-destination]').forEach((button)=>button.addEventListener('click',()=>{root.querySelectorAll('[data-country-destination]').forEach((item)=>item.classList.toggle('active',item===button))}));
    draw();
  }

  function ageMs(timestamp){
    const value=Date.parse(timestamp);
    return Number.isFinite(value)?Math.max(0,Date.now()-value):null;
  }

  function freshnessFromAge(value){
    if(!Number.isFinite(value)||value>60000)return 'UNAVAILABLE';
    if(value>15000)return 'DEGRADED';
    if(value>=5000)return 'STALE';
    return 'FRESH';
  }

  function ageLabel(value){
    if(!Number.isFinite(value))return 'Actualización no verificable';
    const seconds=Math.max(0,Math.floor(value/1000));
    if(seconds<2)return 'Actualizado ahora';
    if(seconds<60)return `Actualizado hace ${seconds} ${seconds===1?'segundo':'segundos'}`;
    const minutes=Math.floor(seconds/60);
    if(minutes<60)return `Actualizado hace ${minutes} ${minutes===1?'minuto':'minutos'}`;
    const hours=Math.floor(minutes/60);
    return `Actualizado hace ${hours} ${hours===1?'hora':'horas'}`;
  }

  function setFreshness(node,status){
    node?.classList.remove('fresh','stale','degraded','unavailable','na');
    node?.classList.add(status.toLowerCase());
  }

  function refreshMarketDisplay(){
    const references=latestMarketSnapshot?.reference_prices||{};
    const deliveryMode=latestMarketSnapshot?.price_delivery_mode||latestMarketSnapshot?.delivery_mode;
    const automated=deliveryMode==='AUTOMATED_5_MINUTE_SNAPSHOT';
    const refreshInterval=Number(latestMarketSnapshot?.price_refresh_interval_ms||latestMarketSnapshot?.refresh_interval_ms)||300000;
    const maxAge=Number(latestMarketSnapshot?.price_max_age_ms||latestMarketSnapshot?.max_age_ms)||(automated?900000:5000);
    const targetAge=Number(latestMarketSnapshot?.price_target_age_ms||latestMarketSnapshot?.max_age_ms)||(automated?900000:5000);
    const marketAssetNodes=[...document.querySelectorAll('[data-market-asset]')];
    const expectedAssets=new Set(marketAssetNodes.map((element)=>element.dataset.marketAsset));
    const availableAssets=new Set();
    latestEthUsd=null;
    marketAssetNodes.forEach((element)=>{
      const reference=references[element.dataset.marketAsset];
      const referenceTimestamp=reference?.received_at||reference?.provider_timestamp;
      const currentAge=referenceTimestamp?ageMs(referenceTimestamp):null;
      const status=reference?.price?freshnessFromAge(currentAge):'UNAVAILABLE';
      const publishable=Number.isFinite(Number(reference?.price))&&(automated?Number.isFinite(currentAge)&&currentAge<=maxAge:status==='FRESH');
      const displayStatus=automated&&publishable?(currentAge<=refreshInterval*2?'FRESH':'STALE'):status;
      if(publishable)availableAssets.add(element.dataset.marketAsset);
      if(publishable&&element.dataset.marketAsset==='ethereum')latestEthUsd=Number(reference.price);
      const price=element.querySelector('.kf-market-price'),age=element.querySelector('[data-market-age]'),venues=element.querySelector('[data-market-venues]');
      if(price)price.textContent=publishable?PRICE.format(reference.price):'No disponible';
      if(age){age.textContent=publishable?ageLabel(currentAge):referenceTimestamp?'Última observación fuera de plazo':'Sin precio observado';setFreshness(age,displayStatus)}
      if(venues)venues.textContent=publishable?(reference.venues||[]).join(' · '):'Esperando la siguiente actualización automática';
      const confidence=element.querySelector('[data-market-confidence]');
      if(confidence){const confidenceLabel={HIGH:'ALTA',MEDIUM:'MEDIA',LOW:'BAJA'}[reference?.confidence]||reference?.confidence;const verificationLabel={VERIFIED:'VERIFICADO',SINGLE_SOURCE:'UNA FUENTE'}[reference?.verification_status]||reference?.verification_status;confidence.textContent=publishable?`${confidenceLabel} · ${verificationLabel}`:'—'}
      const divergence=element.querySelector('[data-market-divergence]');
      if(divergence)divergence.textContent=publishable&&Number.isFinite(reference.metrics?.max_divergence_pct)?`${reference.metrics.max_divergence_pct.toFixed(3)} %`:'—';
    });
    const snapshotAge=ageMs(latestMarketSnapshot?.price_generated_at||latestMarketSnapshot?.generated_at);
    const delayedAutomatic=automated&&Number.isFinite(snapshotAge)&&snapshotAge>targetAge;
    const marketStatus=automated
      ? availableAssets.size===expectedAssets.size
        ? delayedAutomatic
          ? `Última referencia verificada · ${ageLabel(snapshotAge)}`
          : `Precios automáticos · objetivo 5 min · ${ageLabel(snapshotAge)}`
        : availableAssets.size?`${availableAssets.size}/${expectedAssets.size} precios automáticos disponibles`:'Esperando la siguiente actualización automática'
      : availableAssets.size===expectedAssets.size?`Precios en tiempo real · ${ageLabel(snapshotAge)}`:availableAssets.size?`${availableAssets.size}/${expectedAssets.size} precios en tiempo real`:'Actualizando precios…';
    document.querySelectorAll('[data-market-status]').forEach((node)=>node.textContent=marketStatus);
    const priceProviders=['coinbase','kraken','binance'].filter((key)=>{const item=latestMarketSnapshot?.providers?.[key]||{};return ['LIVE','CONNECTED','SNAPSHOT'].includes(item.connection_status)&&Number(item.messages??item.records??0)>0}).length;
    document.querySelectorAll('[data-market-source-summary]').forEach((node)=>node.textContent=priceProviders?`Precio contrastado en ${priceProviders} mercados`:'Metodología y fuentes publicadas');
    updateGasCost();
  }

  function updateGasCost(){
    document.querySelectorAll('[data-gas-cost]').forEach((node)=>{
      const gas=Number(node.dataset.gasGwei);
      node.textContent=Number.isFinite(gas)&&Number.isFinite(latestEthUsd)?SMALL_USD.format(gas*21000/1e9*latestEthUsd):'—';
    });
    document.querySelectorAll('[data-gas-tier]').forEach((card)=>{
      const gas=Number(card.dataset.gasGwei);
      const cost=card.querySelector('[data-gas-tier-cost]');
      if(cost)cost.textContent=Number.isFinite(gas)&&Number.isFinite(latestEthUsd)?SMALL_USD.format(gas*21000/1e9*latestEthUsd):'—';
    });
  }

  function applyGas(item){
    const gas=Number(item?.gas_gwei),valid=Number.isFinite(gas);
    document.querySelectorAll('[data-gas-price]').forEach((node)=>node.textContent=valid?new Intl.NumberFormat('es-ES',{maximumFractionDigits:3}).format(gas):'No disponible');
    document.querySelectorAll('[data-gas-cost]').forEach((node)=>{if(valid)node.dataset.gasGwei=String(gas);else delete node.dataset.gasGwei});
    document.querySelectorAll('[data-gas-status]').forEach((node)=>node.textContent=valid?`Ethereum RPC · ${ageLabel(ageMs(item.received_at))}`:'Ethereum RPC no disponible');
    updateGasCost();
  }

  function applyEthereumFees(item,oracle,liveCadenceMs=null){
    const receivedAge=ageMs(item?.received_at);
    const staticSnapshot=latestMarketSnapshot?.delivery_mode==='STATIC_SNAPSHOT';
    const cadenceMinutes=Number.isFinite(Number(liveCadenceMs))?Math.max(1,Math.round(Number(liveCadenceMs)/60000)):null;
    const maxAge=Number.isFinite(Number(liveCadenceMs))?Math.max(180000,Number(liveCadenceMs)*3):staticSnapshot?Number(latestMarketSnapshot?.thresholds?.snapshot_max_age_ms||93600000):960000;
    const valid=item?.verification_status==='CHAIN_OBSERVED'&&Number.isFinite(receivedAge)&&receivedAge<=maxAge&&Number.isFinite(Number(item?.base_fee_gwei));
    const setText=(selector,value)=>document.querySelectorAll(selector).forEach((node)=>node.textContent=value);
    setText('[data-gas-base]',valid?Number(item.base_fee_gwei).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:3}):'No disponible');
    setText('[data-gas-utilization]',valid&&Number.isFinite(Number(item.gas_used_ratio))?`${(Number(item.gas_used_ratio)*100).toLocaleString('es-ES',{maximumFractionDigits:1})} %`:'No disponible');
    setText('[data-gas-block]',valid&&Number.isFinite(Number(item.block_number))?`#${Number(item.block_number).toLocaleString('es-ES')}`:'No disponible');
    setText('[data-gas-block-time]',valid&&item.provider_timestamp?`Bloque · ${ageLabel(ageMs(item.provider_timestamp))}`:'Timestamp no disponible');
    document.querySelectorAll('[data-gas-tier]').forEach((card)=>{
      const tier=valid?item.tiers?.[card.dataset.gasTier]:null;
      const gas=Number(tier?.max_fee_gwei);
      const publishable=Number.isFinite(gas);
      const label=card.querySelector('[data-gas-tier-gwei]');
      if(label)label.textContent=publishable?gas.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:3}):'No disponible';
      if(publishable)card.dataset.gasGwei=String(gas);else delete card.dataset.gasGwei;
    });
    setText('[data-gas-status]',valid?`${staticSnapshot&&!liveCadenceMs?'Snapshot público Ethereum':'Ethereum directo'} · ${ageLabel(receivedAge)}${cadenceMinutes?` · actualización automática cada ${cadenceMinutes} ${cadenceMinutes===1?'minuto':'minutos'}`:staticSnapshot?' · respaldo diario':' · actualización cada 15 min'}`:'Comisiones no disponibles: no existe una observación dentro del umbral');
    updateGasCost();
  }

  function renderEtfChart(etf,days=7){
    const chart=document.querySelector('[data-etf-chart]');
    if(!chart)return;
    const compact=new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:2});
    const flow=(value)=>Number.isFinite(Number(value))?`${Number(value)>0?'+':''}${compact.format(Number(value))} USD`:'No disponible';
    const allDates=[...new Set(['bitcoin','ethereum'].flatMap((asset)=>(etf?.assets?.[asset]?.series||[]).map((row)=>row.date)))].filter((date)=>/^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
    const anchor=allDates.at(-1);
    const cutoffDate=anchor?new Date(`${anchor}T12:00:00Z`):null;
    if(cutoffDate)cutoffDate.setUTCDate(cutoffDate.getUTCDate()-(days-1));
    const cutoff=cutoffDate?.toISOString().slice(0,10);
    const dates=allDates.filter((date)=>!cutoff||date>=cutoff);
    const byAsset=Object.fromEntries(['bitcoin','ethereum'].map((asset)=>[asset,new Map((etf?.assets?.[asset]?.series||[]).map((row)=>[row.date,Number(row.net_flow_usd)]))]));
    const maximum=Math.max(1,...dates.flatMap((date)=>[Math.abs(byAsset.bitcoin.get(date)||0),Math.abs(byAsset.ethereum.get(date)||0)]));
    const labelEvery=dates.length<=7?1:dates.length<=24?4:Math.ceil(dates.length/8);
    chart.dataset.range=String(days);
    chart.innerHTML=dates.length?dates.map((date,index)=>{
      const btc=byAsset.bitcoin.get(date),eth=byAsset.ethereum.get(date);
      const bars=[['btc',btc],['eth',eth]].map(([asset,value])=>{if(!Number.isFinite(value))return '';const height=Math.max(2,Math.abs(value)/maximum*46);return `<i class="${asset} ${value>=0?'positive':'negative'}" style="--bar-height:${height}%" title="${asset==='btc'?'Bitcoin':'Ethereum'} · ${escapeHtml(flow(value))}"></i>`}).join('');
      const showLabel=index===0||index===dates.length-1||index%labelEvery===0;
      return `<div class="kf-etf-day${showLabel?' labelled':''}"><div>${bars}</div><small>${showLabel?new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short'}).format(new Date(`${date}T12:00:00Z`)).replace('.',''):''}</small></div>`;
    }).join(''):'<div class="kf-live-empty">No hay sesiones publicables en este periodo.</div>';
    for(const asset of ['bitcoin','ethereum']){
      const rows=(etf?.assets?.[asset]?.series||[]).filter((row)=>dates.includes(row.date));
      const total=rows.reduce((sum,row)=>sum+Number(row.net_flow_usd||0),0);
      document.querySelectorAll(`[data-etf-latest-label="${asset}"]`).forEach((node)=>node.textContent=`${asset==='bitcoin'?'Bitcoin':'Ethereum'} · últimos ${days} días`);
      document.querySelectorAll(`[data-etf-latest="${asset}"]`).forEach((node)=>{node.textContent=rows.length?flow(total):'No disponible';node.classList.toggle('positive',rows.length&&total>0);node.classList.toggle('negative',rows.length&&total<0)});
      document.querySelectorAll(`[data-etf-date="${asset}"]`).forEach((node)=>node.textContent=rows.length?`${rows.length} sesiones · hasta ${new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${rows.at(-1).date}T12:00:00Z`))}`:'Sin sesiones');
    }
    const period=document.querySelector('[data-etf-period]');
    if(period)period.textContent=dates.length?`${dates.length} sesiones en los últimos ${days} días · BTC y ETH no se suman entre sí`:`Sin sesiones en los últimos ${days} días`;
    document.querySelectorAll('[data-etf-range]').forEach((button)=>{const active=Number(button.dataset.etfRange)===days;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));if(!button.dataset.bound){button.dataset.bound='true';button.addEventListener('click',()=>renderEtfChart(chart.__etfData,Number(button.dataset.etfRange)||7))}});
    chart.__etfData=etf;
  }

  function renderMarketContext(context){
    const compact=new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:2});
    const usdScale=(value)=>{const numeric=Number(value);if(!Number.isFinite(numeric))return 'No disponible';if(Math.abs(numeric)>=1e9)return `${(numeric/1e9).toLocaleString('es-ES',{maximumFractionDigits:2})} B USD`;if(Math.abs(numeric)>=1e6)return `${(numeric/1e6).toLocaleString('es-ES',{maximumFractionDigits:2})} M USD`;return `${numeric.toLocaleString('es-ES',{maximumFractionDigits:0})} USD`};
    const flow=(value)=>Number.isFinite(Number(value))?`${Number(value)>0?'+':''}${compact.format(Number(value))} USD`:'No disponible';
    const percent=(value)=>Number.isFinite(Number(value))?`${Number(value).toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1})} %`:'—';
    const formatDate=(value)=>{const date=new Date(`${value}T12:00:00Z`);return Number.isNaN(date.getTime())?'Fecha no disponible':new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(date)};
    const generatedAge=ageMs(context?.generated_at);
    const edge=context?.delivery_mode==='LIVE_EDGE_CONTEXT';
    const valid=Number.isFinite(generatedAge)&&generatedAge<=(edge?12*60_000:26*60*60_000);
    const etf=valid?context?.etf_flows:null;
    const reconciliation=etf?.reconciliation?.status;
    const reconciliationLabel={RECONCILED:'Agregado reconciliado con emisor',BASELINE_ESTABLISHED:'Base de emisor creada; espera siguiente sesión',CONFLICT:'Conflicto entre agregado y emisor',AGGREGATOR_ONLY:'Solo agregado; no reconciliado'}[reconciliation]||'Control de emisor pendiente';
    const excludedChecks=Object.entries(etf?.aggregate_checks||{}).filter(([,check])=>check?.included===false&&Number.isFinite(Number(check?.divergence_pct)));
    const etfQuality=excludedChecks.length?`${excludedChecks.map(([asset,check])=>`${asset==='bitcoin'?'BTC':'ETH'}: contraste CoinFlows excluido (${Number(check.divergence_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} % de diferencia)`).join(' · ')}`:reconciliationLabel;
    document.querySelectorAll('[data-etf-status]').forEach((node)=>node.textContent=etf?`Histórico 90 días · ${etfQuality} · ${ageLabel(generatedAge)}`:'Flujos ETF no disponibles');
    const chart=document.querySelector('[data-etf-chart]');
    if(chart)renderEtfChart(etf,Number(chart.dataset.range)||7);
    const dominance=valid?context?.dominance:null;
    for(const key of ['btc','eth','others']){
      const value=Number(dominance?.[`${key}_pct`]);
      document.querySelectorAll(`[data-dominance="${key}"]`).forEach((node)=>node.textContent=Number.isFinite(value)?percent(value):'No disponible');
      document.querySelectorAll(`[data-dominance-bar="${key}"]`).forEach((node)=>node.style.width=Number.isFinite(value)?`${Math.max(0,value)}%`:'0');
    }
    document.querySelectorAll('[data-dominance-time]').forEach((node)=>node.textContent=dominance?`CoinGecko · ${ageLabel(ageMs(dominance.provider_timestamp))}`:'Dominancia no disponible');
    const oi=valid?context?.open_interest:null;
    document.querySelectorAll('[data-open-interest]').forEach((node)=>node.textContent=usdScale(oi?.open_interest_usd));
    document.querySelectorAll('[data-open-interest-change]').forEach((node)=>{const value=Number(oi?.change_7d_pct);node.textContent=Number.isFinite(value)?`7 días ${value>0?'+':''}${value.toLocaleString('es-ES',{maximumFractionDigits:2})} %`:'Variación 7 d no disponible';node.classList.toggle('positive',value>0);node.classList.toggle('negative',value<0)});
    document.querySelectorAll('[data-open-interest-time]').forEach((node)=>node.textContent=oi?`DefiLlama · ${ageLabel(ageMs(oi.provider_timestamp))}`:'Perímetro no disponible');
    document.querySelectorAll('[data-open-interest-venues]').forEach((node)=>node.innerHTML=(oi?.top_venues||[]).slice(0,3).map((venue)=>`<li><span>${escapeHtml(venue.name)}</span><strong>${usdScale(venue.open_interest_usd)}</strong></li>`).join(''));
    const dvol=valid?context?.implied_volatility:null;
    for(const asset of ['btc','eth'])document.querySelectorAll(`[data-dvol="${asset}"]`).forEach((node)=>node.textContent=Number.isFinite(Number(dvol?.assets?.[asset]?.value))?Number(dvol.assets[asset].value).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}):'No disponible');
    const dvolTimestamp=dvol?.assets?.btc?.provider_timestamp||dvol?.assets?.eth?.provider_timestamp;
    document.querySelectorAll('[data-dvol-time]').forEach((node)=>node.textContent=dvolTimestamp?`Último índice · ${ageLabel(ageMs(dvolTimestamp))}`:'DVOL no disponible');
  }

  function applyExchangeFee(item,sourceLabel='Fuentes oficiales'){
    if(!item)return false;
    const rows=Array.isArray(item.entries)?item.entries:[];
    document.querySelectorAll('[data-exchange-fee-rows]').forEach((root)=>{root.innerHTML=rows.map((row)=>{const exact=row.availability==='PUBLIC_EXACT';const format=(value)=>value!==null&&value!==''&&Number.isFinite(Number(value))?`${Number(value).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:3})} %`:'Según cuenta';return `<tr><td><strong>${escapeHtml(row.exchange)}</strong><small>${exact?'Tabla pública exacta':'Cifra exacta bloqueada'}</small></td><td>${escapeHtml(row.market)}<small>${escapeHtml(row.conditions)}</small></td><td class="number">${format(row.maker_pct)}</td><td class="number">${format(row.taker_pct)}</td><td><a href="${safeExternalUrl(row.source_url)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a></td></tr>`}).join('')||'<tr><td colspan="5">Tarifas no disponibles.</td></tr>'});
    document.querySelectorAll('[data-exchange-fee-status]').forEach((node)=>node.textContent=sourceLabel);
    return rows.length>0;
  }

  function renderProviders(providers={}){
    const roots=[...document.querySelectorAll('[data-provider-group]')];
    if(!roots.length)return;
    const groups={price:['coinbase','kraken','binance'],context:['dexscreener','coingecko_metadata'],infrastructure:['defillama_tokenization','l2beat_projects','ethereum_rpc']};
    const names={coinbase:'Coinbase',kraken:'Kraken',binance:'Binance',dexscreener:'DEX Screener',coingecko_metadata:'CoinGecko',defillama_tokenization:'DefiLlama',l2beat_projects:'L2BEAT',ethereum_rpc:'Ethereum RPC'};
    const roles={coinbase:'Precio spot BTC/ETH',kraken:'Precio spot BTC/ETH',binance:'Mercado adicional y conversión',dexscreener:'Pools y operaciones DEX',coingecko_metadata:'Identidad, capitalización y oferta',defillama_tokenization:'Capital RWA y redes',l2beat_projects:'Madurez y riesgos L2',ethereum_rpc:'Gas y estado de Ethereum'};
    roots.forEach((root)=>{
      const keys=groups[root.dataset.providerGroup]||[];
      root.innerHTML=keys.map((key)=>{
        const item=providers[key]||{},status=item.connection_status||'UNAVAILABLE';
        const observations=Number(item.messages??item.records??0);
        const connected=['LIVE','CONNECTED','SNAPSHOT'].includes(status)&&observations>0;
        const degraded=status==='DEGRADED'&&observations>0;
        const state=connected?'CONECTADA':degraded?'DEGRADADA':observations===0?'SIN REGISTROS':'NO DISPONIBLE';
        const stateClass=connected?'connected':degraded?'degraded':'unavailable';
        const observed=item.last_message_at?ageLabel(ageMs(item.last_message_at)):'Sin observación reciente';
        return `<article class="kf-provider-status-row"><div><i class="${stateClass}"></i><strong>${escapeHtml(names[key])}</strong></div><span>${escapeHtml(roles[key])}</span><b class="${stateClass}">${state}</b><small>${observations.toLocaleString('es-ES')} registros · ${observed}</small></article>`;
      }).join('');
    });
  }

  function renderStablecoins(stablecoins={}){
    const root=document.querySelector('[data-stablecoin-grid]');
    if(!root)return;
    const automated=latestMarketSnapshot?.delivery_mode==='AUTOMATED_5_MINUTE_SNAPSHOT';
    const maxAge=Number(latestMarketSnapshot?.price_max_age_ms||latestMarketSnapshot?.max_age_ms)||(automated?900000:5000);
    root.innerHTML=['USDT','USDC'].map((currency)=>{const item=stablecoins[currency],itemAge=ageMs(item?.received_at||item?.provider_timestamp),valid=item?.price&&(automated?Number.isFinite(itemAge)&&itemAge<=maxAge:freshnessFromAge(itemAge)==='FRESH');return `<article class="kf-stable-card"><span>${currency} / USD</span><strong>${valid?Number(item.price).toFixed(6):'No disponible'}</strong><small>${item?.received_at||item?.provider_timestamp?ageLabel(itemAge):'Sin tipo observado'} · ${valid?item.venues.join(' · '):'no se normalizan parejas '+currency}</small></article>`}).join('');
  }

  function renderDexPools(pools=[]){
    const root=document.querySelector('[data-dex-pools]');
    if(!root)return;
    const compact=new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:2});
    root.innerHTML=pools.length?pools.map((pool)=>{
      const verified=['VERIFIED','SOURCE_CROSSCHECKED'].includes(pool.verification_status)&&pool.exact_trade_timestamp_available;
      const observedAge=ageMs(pool.provider_timestamp);
      const status=verified?'SWAP ONCHAIN VERIFICADO':'REVISIÓN NECESARIA';
      const chainRef=Number.isFinite(Number(pool.onchain_evidence?.block_number))?`bloque #${Number(pool.onchain_evidence.block_number).toLocaleString('es-ES')}`:Number.isFinite(Number(pool.onchain_evidence?.slot))?`slot ${Number(pool.onchain_evidence.slot).toLocaleString('es-ES')}`:'referencia onchain';
      const evidence=verified?`Último swap · ${chainRef} · ${ageLabel(observedAge)}${Number.isFinite(Number(pool.reference_deviation_pct))?` · desv. ${Number(pool.reference_deviation_pct).toLocaleString('es-ES',{maximumFractionDigits:2})} %`:''}`:'Cifras bloqueadas hasta reconciliar DEX y cadena';
      return `<tr><td><strong>${escapeHtml(pool.name)}</strong><small class="kf-contract">${escapeHtml(pool.chain_id)} · ${escapeHtml(pool.contract_address)}</small></td><td><a href="${safeExternalUrl(pool.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(pool.dex||'DEX')} ↗</a><small class="kf-contract">${escapeHtml(pool.pair_address||'')}</small></td><td class="number">${verified&&Number.isFinite(Number(pool.price))?`${Number(pool.price).toLocaleString('es-ES',{maximumFractionDigits:6})} ${escapeHtml(pool.currency)}`:'—'}</td><td class="number">${verified&&Number.isFinite(Number(pool.volume_24h_quote))?compact.format(pool.volume_24h_quote):'—'}</td><td class="number">${verified&&Number.isFinite(Number(pool.liquidity_usd))?`${compact.format(pool.liquidity_usd)} USD`:'—'}</td><td><span class="kf-data-state ${verified?'verified':'unverified'}">${status}</span><small class="kf-data-evidence"><a href="${safeExternalUrl(pool.onchain_evidence?.evidence_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(evidence)} ↗</a></small></td></tr>`;
    }).join(''):'<tr><td colspan="6">DEX Screener no disponible.</td></tr>';
  }

  function renderMetadata(metadata={}){
    const compact=new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:2});
    const ids=['bitcoin','ethereum'];
    const card=(id)=>{const item=metadata[id],valid=item?.verification_status==='VERIFIED';return `<article class="kf-metadata-card"><img src="${assetUrl(`/assets/logos/${id}.svg`)}" alt="Logo de ${escapeHtml(item?.name||id)}"><div><span>${escapeHtml(item?.name||id)}</span><strong>${valid&&Number.isFinite(Number(item.market_cap_usd))?`${compact.format(item.market_cap_usd)} USD`:'No disponible'}</strong><small>Capitalización · ${valid&&Number.isFinite(Number(item.circulating_supply))?`${compact.format(item.circulating_supply)} en circulación`:'oferta no disponible'}</small></div></article>`};
    const slots=[...document.querySelectorAll('[data-market-metadata-slot]')];
    if(slots.length){slots.forEach((slot)=>{slot.innerHTML=card(slot.dataset.marketMetadataSlot)});return}
    const root=document.querySelector('[data-market-metadata]');
    if(root)root.innerHTML=ids.map(card).join('');
  }

  function tokenizedUsd(value){
    const number=Number(value);
    if(!Number.isFinite(number))return 'No disponible';
    if(Math.abs(number)>=1e9)return `${(number/1e9).toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:2})} mil M USD`;
    if(Math.abs(number)>=1e6)return `${(number/1e6).toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:2})} M USD`;
    return `${number.toLocaleString('es-ES',{maximumFractionDigits:0})} USD`;
  }

  function tokenizationDataValid(data){
    const observedAge=ageMs(data?.received_at);
    return data?.verification_status==='SOURCE_OBSERVED'&&Number.isFinite(observedAge)&&observedAge<=86400000;
  }

  function renderTokenizationProducts(data,valid){
    const root=document.querySelector('[data-token-products]');
    if(!root)return;
    const search=document.querySelector('[data-token-product-search]');
    const segment=document.querySelector('[data-token-segment-filter]');
    const network=document.querySelector('[data-token-network-filter]');
    const sort=document.querySelector('[data-token-product-sort]');
    const products=valid?(data?.products||[]):[];
    const populate=(select,values,label)=>{
      if(!select||select.dataset.snapshot===data?.received_at)return;
      const current=select.value;
      select.innerHTML=`<option value="all">${label}</option>${values.map((value)=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}`;
      if([...select.options].some((option)=>option.value===current))select.value=current;
      select.dataset.snapshot=data?.received_at||'';
    };
    populate(segment,[...new Set(products.flatMap((product)=>product.tags||[]))].sort((a,b)=>a.localeCompare(b)),'Todas las clases');
    populate(network,[...new Set(products.flatMap((product)=>product.networks||[]))].sort((a,b)=>a.localeCompare(b)),'Todas las redes');
    const query=(search?.value||'').trim().toLowerCase(),segmentValue=segment?.value||'all',networkValue=network?.value||'all',sortValue=sort?.value||'value-desc';
    const expanded=root.dataset.expanded==='true';
    const signature=[data?.received_at,query,segmentValue,networkValue,sortValue,valid,expanded].join('|');
    if(root.dataset.signature===signature)return;
    root.dataset.signature=signature;
    const rows=products.filter((product)=>{
      const haystack=[product.name,product.slug,...(product.tags||[]),...(product.networks||[])].join(' ').toLowerCase();
      return (!query||haystack.includes(query))&&(segmentValue==='all'||product.tags?.includes(segmentValue))&&(networkValue==='all'||product.networks?.includes(networkValue));
    }).sort((a,b)=>{
      if(sortValue==='change-desc')return (Number.isFinite(Number(b.change_7d_pct))?Number(b.change_7d_pct):-Infinity)-(Number.isFinite(Number(a.change_7d_pct))?Number(a.change_7d_pct):-Infinity);
      if(sortValue==='change-asc')return (Number.isFinite(Number(a.change_7d_pct))?Number(a.change_7d_pct):Infinity)-(Number.isFinite(Number(b.change_7d_pct))?Number(b.change_7d_pct):Infinity);
      if(sortValue==='name')return a.name.localeCompare(b.name);
      return Number(b.value_usd)-Number(a.value_usd);
    });
    const visibleRows=expanded?rows:rows.slice(0,5);
    const count=document.querySelector('[data-token-product-count]');
    if(count)count.textContent=expanded?`${rows.length.toLocaleString('es-ES')} productos`:`${Math.min(5,rows.length).toLocaleString('es-ES')} de ${rows.length.toLocaleString('es-ES')} productos`;
    const expand=document.querySelector('[data-token-product-expand]');
    if(expand){expand.hidden=rows.length<=5;expand.setAttribute('aria-expanded',String(expanded));expand.textContent=expanded?'Mostrar solo 5':`Ver ${rows.length.toLocaleString('es-ES')} productos`}
    root.innerHTML=rows.length?visibleRows.map((product)=>{
      const change=Number(product.change_7d_pct),deviation=Number(product.data_quality?.raw_chain_breakdown_deviation_pct);
      const quality=!product.source_url?'PARCIAL':Number.isFinite(deviation)&&deviation>2?'NORMALIZADO':'TRAZABLE';
      const qualityClass=quality==='TRAZABLE'?'good':quality==='NORMALIZADO'?'warning':'partial';
      return `<tr><td><strong>${escapeHtml(product.name)}</strong><small class="kf-contract">${escapeHtml(product.slug||product.id)}</small></td><td>${(product.tags||[]).slice(0,2).map((tag)=>`<span class="kf-rwa-tag">${escapeHtml(tag)}</span>`).join('')||'Sin clase'}</td><td class="number"><strong>${tokenizedUsd(product.value_usd)}</strong></td><td class="number">${Number(product.share_pct).toLocaleString('es-ES',{maximumFractionDigits:2})} %</td><td class="number ${Number.isFinite(change)?change>=0?'positive':'negative':''}">${Number.isFinite(change)?`${change>=0?'+':''}${change.toLocaleString('es-ES',{maximumFractionDigits:2})} %`:'—'}</td><td><strong>${Number(product.networks?.length||0).toLocaleString('es-ES')}</strong><small class="kf-contract">${(product.networks||[]).slice(0,3).map(escapeHtml).join(' · ')}${product.networks?.length>3?' · …':''}</small></td><td><span class="kf-token-quality-pill ${qualityClass}">${quality}</span>${product.source_url?`<a href="${safeExternalUrl(product.source_url)}" target="_blank" rel="noopener noreferrer">Proyecto ↗</a>`:''}${product.adapter_url?`<a href="${safeExternalUrl(product.adapter_url)}" target="_blank" rel="noopener noreferrer">Adaptador ↗</a>`:''}</td></tr>`;
    }).join(''):'<tr><td colspan="7">No hay productos que coincidan con estos filtros.</td></tr>';
  }

  function renderTokenizationMovers(data,valid){
    const draw=(selector,rows,direction)=>{
      const root=document.querySelector(selector);if(!root)return;
      root.innerHTML=valid&&rows?.length?rows.map((product,index)=>`<div class="kf-token-mover-row"><span>${String(index+1).padStart(2,'0')}</span><div><strong>${escapeHtml(product.name)}</strong><small>${tokenizedUsd(product.value_usd)}</small></div><b class="${direction}">${Number(product.change_7d_pct)>=0?'+':''}${Number(product.change_7d_pct).toLocaleString('es-ES',{maximumFractionDigits:2})} %</b></div>`).join(''):'<div class="kf-live-empty">Movimiento no disponible.</div>';
    };
    draw('[data-token-gainers]',data?.movers?.gainers,'positive');
    draw('[data-token-decliners]',data?.movers?.decliners,'negative');
  }

  function tokenizationAnswer(query,data,l2){
    if(!tokenizationDataValid(data))return {title:'Datos no disponibles',text:'No existe un snapshot de tokenización recibido durante las últimas 24 horas.',method:'Kaufman no responde con el último valor conocido.'};
    const clean=String(query||'').toLowerCase();
    const topProduct=data.products?.[0],topNetwork=data.networks?.[0],topSegment=[...(data.segments||[])].sort((a,b)=>b.value_usd-a.value_usd)[0];
    const gainer=data.movers?.gainers?.[0],decliner=data.movers?.decliners?.[0];
    if(/calidad|fiable|sabemos|falta|hueco|evidencia/.test(clean))return {title:'Cobertura y enlace de fuentes',text:`Se publican ${data.data_quality.published_products} de ${data.data_quality.raw_rwa_records} registros RWA. ${data.data_quality.project_link_coverage_pct.toLocaleString('es-ES',{maximumFractionDigits:1})} % incluye enlace de proyecto y ${data.data_quality.raw_chain_breakdown_mismatch_records} desgloses por red tuvieron que normalizarse.`,method:'No existe timestamp por producto: la pantalla usa hora de recepción y se bloquea tras 24 horas.'};
    if(/stable|dólar|dolar|liquid|rail/.test(clean))return {title:'Capital en stablecoins frente a RWA',text:`El valor circulante en stablecoins USD alcanza ${tokenizedUsd(data.kpis.usd_stablecoin_value_usd)}, ${Number(data.ratios.stablecoin_to_rwa_multiple).toLocaleString('es-ES',{maximumFractionDigits:2})} veces el capital RWA rastreado. La variación de oferta valorada en 24 h es ${Number(data.ratios.stablecoin_supply_change_24h_pct).toLocaleString('es-ES',{maximumFractionDigits:3})} %.`,method:'Circulación multiplicada por precio observado; no se presupone paridad 1:1.'};
    if(/mov|cambi|crec|sub|baj|semana/.test(clean))return {title:'Variación semanal con capital mínimo',text:gainer&&decliner?`${gainer.name} registra ${Number(gainer.change_7d_pct).toLocaleString('es-ES',{maximumFractionDigits:2})} % y ${decliner.name} registra ${Number(decliner.change_7d_pct).toLocaleString('es-ES',{maximumFractionDigits:2})} %.`:'No hay dos extremos publicables en los datos actuales.',method:`Solo productos con al menos ${tokenizedUsd(data.movers.minimum_tvl_usd)}; variación del agregador, no rentabilidad del inversor.`};
    if(/red|ethereum|infra|cadena|l2/.test(clean)){
      const publicRwa=(l2?.projects||[]).filter((project)=>Number(project.rwa_public_usd)>0).sort((a,b)=>b.rwa_public_usd-a.rwa_public_usd)[0];
      return {title:'Concentración por red y dependencia técnica',text:`${topNetwork?.name||'La red con mayor capital'} concentra ${Number(topNetwork?.share_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} % de la asignación RWA normalizada.${publicRwa?` En los datos de L2BEAT, ${publicRwa.name} registra ${tokenizedUsd(publicRwa.rwa_public_usd)} de RWA público y figura con ${publicRwa.stage_label_es||'madurez no asignada'}.`:''}`,method:'DefiLlama y L2BEAT mantienen coberturas distintas; sus valores se muestran juntos, pero nunca se suman.'};
    }
    if(/clase|activo|deuda|bono|tesoro|compos/.test(clean))return {title:'Capital rastreado por clase de activo',text:`${topSegment?.label||'La clase con mayor capital'} representa ${Number(topSegment?.share_of_tracked_rwa_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} % del TVL RWA rastreado mediante ${Number(topSegment?.protocol_count||0).toLocaleString('es-ES')} productos.`,method:'Las etiquetas pueden solaparse; sus importes no deben sumarse entre sí.'};
    return {title:'Capital rastreado y concentración top 5',text:`Kaufman rastrea ${tokenizedUsd(data.kpis.tracked_rwa_tvl_usd)} en ${data.coverage.rwa_protocols} productos. ${topProduct?.name||'El producto con mayor capital'} registra ${topProduct?tokenizedUsd(topProduct.value_usd):'valor no disponible'} y el top 5 concentra ${Number(data.ratios.top_5_concentration_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} %.`,method:'Respuesta construida solo con el snapshot conectado; no añade conocimiento externo.'};
  }

  function renderTokenizationAnswer(query,data,l2,isDefault=false){
    const root=document.querySelector('[data-token-answer]');if(!root)return;
    const answer=isDefault&&data?.analysis_engine?.insights?.[0]?{title:data.analysis_engine.insights[0].title,text:data.analysis_engine.insights[0].statement,method:data.analysis_engine.insights[0].methodology}:tokenizationAnswer(query,data,l2);
    root.innerHTML=`<span>ANÁLISIS CON EVIDENCIA</span><strong>${escapeHtml(answer.title)}</strong><p>${escapeHtml(answer.text)}</p><small>${escapeHtml(answer.method)}</small>`;
    if(!isDefault)root.dataset.interacted='true';
  }

  function renderTokenizationQuality(data,valid){
    document.querySelectorAll('[data-token-quality]').forEach((node)=>{
      const key=node.dataset.tokenQuality,value=data?.data_quality?.[key];
      node.textContent=valid&&Number.isFinite(Number(value))?(key.endsWith('_pct')?`${Number(value).toLocaleString('es-ES',{maximumFractionDigits:1})} %`:Number(value).toLocaleString('es-ES')):'No disponible';
    });
    const detail=document.querySelector('[data-token-quality-detail="published"]');
    if(detail)detail.textContent=valid?`${data.data_quality.published_products} publicados · ${data.data_quality.raw_rwa_records-data.data_quality.published_products} excluidos`:'Sin cobertura publicable';
    const multiple=document.querySelector('[data-token-multiple]');
    if(multiple)multiple.textContent=valid&&Number.isFinite(Number(data.ratios?.stablecoin_to_rwa_multiple))?`${Number(data.ratios.stablecoin_to_rwa_multiple).toLocaleString('es-ES',{maximumFractionDigits:2})}×`:'No disponible';
  }

  function renderTokenizationL2(l2){
    const root=document.querySelector('[data-token-l2-rows]');if(!root)return;
    const valid=l2?.verification_status==='SOURCE_OBSERVED'&&Number.isFinite(ageMs(l2.received_at))&&ageMs(l2.received_at)<=86400000;
    const rows=valid?(l2.projects||[]).filter((project)=>Number(project.rwa_public_usd)>0).sort((a,b)=>b.rwa_public_usd-a.rwa_public_usd):[];
    root.innerHTML=rows.length?rows.map((project)=>`<tr><td><strong>${escapeHtml(project.name)}</strong><small class="kf-contract">${escapeHtml(project.category_es||'L2')}</small></td><td><span class="kf-token-stage">${escapeHtml(project.stage_label_es||'Madurez no asignada')}</span></td><td class="number">${tokenizedUsd(project.rwa_public_usd)}</td><td class="number">${Number(project.tvs_usd)?`${(Number(project.rwa_public_usd)/Number(project.tvs_usd)*100).toLocaleString('es-ES',{maximumFractionDigits:2})} %`:'—'}</td><td class="number">${Number.isFinite(Number(project.additional_trust_share_pct))?`${Number(project.additional_trust_share_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} %`:'—'}</td><td>${escapeHtml(project.data_availability||'No indicado')}</td><td><a href="${safeExternalUrl(project.source_url)}" target="_blank" rel="noopener noreferrer">L2BEAT ↗</a></td></tr>`).join(''):'<tr><td colspan="7">Contexto L2 no disponible.</td></tr>';
  }

  function renderTokenizationSourceHealth(providers={}){
    document.querySelectorAll('[data-token-source-health]').forEach((node)=>{
      const status=providers[node.dataset.tokenSourceHealth]?.connection_status||'UNAVAILABLE';
      if(node.className!==status.toLowerCase())node.className=status.toLowerCase();
      if(node.getAttribute('title')!==status)node.setAttribute('title',status);
    });
  }

  function renderTokenizationIntelligence(snapshot){
    const dashboard=document.querySelector('[data-tokenization-dashboard]');if(!dashboard)return;
    const data=snapshot?.tokenization_markets,l2=snapshot?.l2_intelligence,valid=tokenizationDataValid(data);
    renderTokenizationProducts(data,valid);
    renderTokenizationSourceHealth(snapshot?.providers);
    const dataChanged=dashboard.dataset.snapshot!==String(data?.received_at||'');
    const l2Changed=dashboard.dataset.l2Snapshot!==String(l2?.received_at||'');
    if(!dataChanged&&!l2Changed)return;
    dashboard.dataset.snapshot=String(data?.received_at||'');dashboard.dataset.l2Snapshot=String(l2?.received_at||'');
    renderTokenizationMovers(data,valid);
    renderTokenizationQuality(data,valid);
    renderTokenizationL2(l2);
    const policy=document.querySelector('[data-token-engine-policy]');
    if(policy)policy.textContent=valid?`${data.analysis_engine?.name||'Análisis Kaufman'} · ${data.analysis_engine?.mode||''} · sin LLM externo`:'Motor detenido hasta recibir un snapshot válido';
    const answer=document.querySelector('[data-token-answer]');
    if(answer&&!answer.dataset.interacted)renderTokenizationAnswer('',data,l2,true);
  }

  function renderTokenizationMarkets(data){
    const observedAge=ageMs(data?.received_at);
    const valid=data?.verification_status==='SOURCE_OBSERVED'&&Number.isFinite(observedAge)&&observedAge<=86400000;
    const status=document.querySelector('[data-tokenization-status]');
    const ageBucket=Number.isFinite(observedAge)?Math.floor(observedAge/60000):-1;
    const renderSignature=`${data?.received_at||'none'}|${valid}|${ageBucket}`;
    if(status?.dataset.renderSignature===renderSignature)return;
    if(status)status.dataset.renderSignature=renderSignature;
    if(status)status.textContent=valid?`${ageBucket<1?'Recibido hace menos de 1 min':`Recibido hace ${ageBucket} min`} · fuente pública server-side`:'Datos no disponibles o recepción superior a 24 h';
    document.querySelectorAll('[data-token-kpi]').forEach((node)=>{
      const value=data?.kpis?.[node.dataset.tokenKpi];
      node.textContent=valid&&Number.isFinite(Number(value))?tokenizedUsd(value):'No disponible';
    });
    document.querySelectorAll('[data-token-ratio]').forEach((node)=>{
      const value=data?.ratios?.[node.dataset.tokenRatio];
      node.textContent=valid&&Number.isFinite(Number(value))?`${Number(value).toLocaleString('es-ES',{minimumFractionDigits:node.dataset.tokenRatio.includes('change')?3:1,maximumFractionDigits:node.dataset.tokenRatio.includes('change')?3:1})} %`:'No disponible';
      node.classList.toggle('positive',valid&&Number(value)>0&&node.dataset.tokenRatio.includes('change'));
      node.classList.toggle('negative',valid&&Number(value)<0&&node.dataset.tokenRatio.includes('change'));
    });
    const barMarkup=(rows,withProtocols=false)=>{
      const selected=valid?rows.slice(0,7):[];
      const max=Math.max(...selected.map((row)=>Number(row.value_usd)||0),1);
      return selected.length?selected.map((row)=>`<div class="kf-rwa-bar-row"><div><strong>${escapeHtml(row.label||row.name)}</strong><span>${withProtocols?`${Number(row.protocol_count||0).toLocaleString('es-ES')} protocolos · `:''}${tokenizedUsd(row.value_usd)}${Number.isFinite(Number(row.share_pct))?` · ${Number(row.share_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} %`:''}</span></div><i><b style="width:${Math.max(1,Math.min(100,Number(row.value_usd)/max*100)).toFixed(2)}%"></b></i></div>`).join(''):'<div class="kf-live-empty">Datos no disponibles.</div>';
    };
    const segments=document.querySelector('[data-token-segments]');
    if(segments)segments.innerHTML=barMarkup((data?.segments||[]).map((row)=>({...row,share_pct:row.share_of_tracked_rwa_pct})),true);
    const networks=document.querySelector('[data-token-networks]');
    if(networks)networks.innerHTML=barMarkup(data?.networks||[],true);
    const stableNetworks=document.querySelector('[data-token-stablecoin-networks]');
    if(stableNetworks)stableNetworks.innerHTML=barMarkup(data?.stablecoin_networks||[]);
    const leaders=document.querySelector('[data-token-leaders]');
    if(leaders){
      const rows=valid?(data?.leaders||[]).slice(0,8):[];
      leaders.innerHTML=rows.length?rows.map((row)=>{const change=Number(row.change_7d_pct);return `<tr><td><strong>${escapeHtml(row.name)}</strong></td><td>${(row.tags||[]).length?(row.tags||[]).slice(0,2).map((tag)=>`<span class="kf-rwa-tag">${escapeHtml(tag)}</span>`).join(''):'Sin etiqueta'}</td><td class="number">${tokenizedUsd(row.value_usd)}</td><td><strong>${Number(row.networks?.length||0).toLocaleString('es-ES')}</strong><small class="kf-contract">${(row.networks||[]).slice(0,3).map(escapeHtml).join(' · ')}${row.networks?.length>3?' · …':''}</small></td><td class="number ${Number.isFinite(change)?change>=0?'positive':'negative':''}">${Number.isFinite(change)?`${change>=0?'+':''}${change.toLocaleString('es-ES',{maximumFractionDigits:2})} %`:'—'}</td><td>${row.source_url?`<a href="${safeExternalUrl(row.source_url)}" target="_blank" rel="noopener noreferrer">Emisor ↗</a>`:''}${row.adapter_url?`<a class="kf-rwa-adapter" href="${safeExternalUrl(row.adapter_url)}" target="_blank" rel="noopener noreferrer">Adaptador ↗</a>`:''}</td></tr>`}).join(''):'<tr><td colspan="6">Datos RWA no disponibles.</td></tr>';
    }
    const coverage=document.querySelector('[data-token-coverage]');
    if(coverage)coverage.textContent=valid?`${Number(data.coverage?.rwa_protocols||0).toLocaleString('es-ES')} protocolos · ${Number(data.coverage?.networks||0).toLocaleString('es-ES')} redes · ${Number(data.coverage?.excluded_rwa_records||0).toLocaleString('es-ES')} registros excluidos`:'No disponible';
    const methodology=document.querySelector('[data-token-methodology]');
    if(methodology)methodology.textContent=valid?`${data.methodology?.summary||''} ${data.methodology?.segment_warning||''}`:'Los valores se ocultan si la fuente no responde o la recepción supera 24 horas.';
  }

  function renderL2Intelligence(data){
    const receivedAge=ageMs(data?.received_at);
    const valid=data?.verification_status==='SOURCE_OBSERVED'&&Number.isFinite(receivedAge)&&receivedAge<=86400000;
    const status=document.querySelector('[data-l2-status]');
    if(status)status.textContent=valid?`${ageLabel(receivedAge)} · L2BEAT server-side`:'Datos L2 no disponibles o recepción superior a 24 h';
    document.querySelectorAll('[data-l2-kpi]').forEach((node)=>{
      const key=node.dataset.l2Kpi,value=data?.kpis?.[key];
      const isMoney=key==='total_l2_tvs_usd'||key==='curated_public_rwa_usd';
      node.textContent=valid&&Number.isFinite(Number(value))?(isMoney?tokenizedUsd(value):Number(value).toLocaleString('es-ES')):'No disponible';
    });
    const root=document.querySelector('[data-l2-projects]');
    if(root){
      const projects=valid?(data.projects||[]):[];
      root.innerHTML=projects.length?projects.map((project)=>{
        const metrics=[
          ['TVS',tokenizedUsd(project.tvs_usd)],
          ['Cambio 7 d',Number.isFinite(Number(project.tvs_change_7d_pct))?`${Number(project.tvs_change_7d_pct)>=0?'+':''}${Number(project.tvs_change_7d_pct).toLocaleString('es-ES',{maximumFractionDigits:2})} %`:'—'],
          ['Stablecoins',Number.isFinite(Number(project.stablecoin_share_pct))?`${Number(project.stablecoin_share_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} % TVS`:'—'],
          ['Confianza adicional',Number.isFinite(Number(project.additional_trust_share_pct))?`${Number(project.additional_trust_share_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} % TVS`:'—'],
          ['RWA público',Number.isFinite(Number(project.rwa_public_usd))?tokenizedUsd(project.rwa_public_usd):'—']
        ];
        const risks=(project.risks||[]).map((risk)=>`<li class="${escapeHtml(risk.sentiment||'neutral')}"><div><strong>${escapeHtml(risk.name)}</strong><span>${escapeHtml(risk.value)}</span></div><p>${escapeHtml(risk.explanation)}</p><small>Original L2BEAT: ${escapeHtml(risk.original_name)} · ${escapeHtml(risk.original_value)}</small></li>`).join('');
        const signals=(project.signals||[]).map((signal)=>`<span>${escapeHtml(String(signal).replaceAll('_',' '))}</span>`).join('');
        const logo=project.logo_url?`<span class="kf-l2-logo"><img src="${safeExternalUrl(project.logo_url)}" alt="Símbolo actual de ${escapeHtml(project.name)}" loading="lazy" decoding="async"></span>`:`<span class="kf-l2-logo fallback" aria-label="Símbolo no disponible">${escapeHtml(project.name.slice(0,2).toUpperCase())}</span>`;
        return `<article class="kf-l2-project"><header><div><span>${escapeHtml(project.category_es||'L2')} · ${(project.purposes_es||[]).map(escapeHtml).join(' · ')}</span><h3>${escapeHtml(project.name)}</h3><small>${(project.stacks||[]).map(escapeHtml).join(' · ')||'Stack no indicado'} · DA: ${escapeHtml(project.data_availability||'no indicada')}</small></div>${logo}</header><p class="kf-l2-stage"><strong>${escapeHtml(project.stage_label_es||'Madurez no asignada')}</strong> · ${escapeHtml(project.stage_explanation||'')}</p><div class="kf-l2-metrics">${metrics.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>${signals?`<div class="kf-l2-signals">${signals}</div>`:''}<ul class="kf-l2-risks">${risks}</ul><a class="kf-l2-source" href="${safeExternalUrl(project.source_url)}" target="_blank" rel="noopener noreferrer">Abrir ficha original en L2BEAT ↗</a></article>`;
      }).join(''):'<div class="kf-live-empty">L2BEAT no está disponible. Kaufman no sustituye el dato por una cifra antigua.</div>';
    }
    const coverage=document.querySelector('[data-l2-coverage]');
    if(coverage)coverage.textContent=valid?`${Number(data.coverage?.projects||0).toLocaleString('es-ES')} proyectos · ${Number(data.coverage?.curated_projects||0).toLocaleString('es-ES')} fichas explicadas · ${Number(data.coverage?.under_review||0).toLocaleString('es-ES')} en revisión`:'No disponible';
    const methodology=document.querySelector('[data-l2-methodology]');
    if(methodology)methodology.textContent=valid?`${data.methodology?.selection||''} ${data.methodology?.summary||''} ${data.methodology?.stage_caveat||''} ${data.methodology?.translation_caveat||''}`:'Los datos se ocultan si L2BEAT no responde o la recepción supera 24 horas.';
  }

  function renderWalletIntelligence(data){
    const receivedAge=ageMs(data?.generated_at);
    const valid=['kaufman-wallet-intelligence-v1','kaufman-wallet-intelligence-v2'].includes(data?.schema_version)&&Number.isFinite(receivedAge)&&receivedAge<=172800000;
    const products=Object.fromEntries((valid?data.products:[]).map((item)=>[item.id,item]));
    document.querySelectorAll('[data-wallet-release]').forEach((node)=>{
      const item=products[node.dataset.walletRelease];
      if(!item){node.textContent=node.dataset.walletRelease==='safe'?'No aplica · configuración onchain':'Release oficial no disponible';return}
      const release=item.application||item;
      const published=release?.published_at?new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(release.published_at)):'fecha no disponible';
      const firmware=(item.firmware||[]).map((row)=>`${escapeHtml(row.model||'Firmware')}: ${escapeHtml(row.version||row.label||row.status)}`).join(' · ');
      const advisories=item.advisories?`${Number(item.advisories.open_or_published_count||0).toLocaleString('es-ES')} avisos públicos observados`:'Registro de avisos no observado';
      const service=item.service?.indicator?`Servicio: ${escapeHtml(item.service.indicator)}`:'Estado público no publicado';
      node.innerHTML=`<a href="${safeExternalUrl(release?.source_url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(release?.version||'Release no disponible')}</strong><span>Aplicación · ${escapeHtml(published)} ↗</span></a><small>${firmware||'Firmware no aplica'}</small><small>${advisories} · ${service}</small>`;
      node.title=data.methodology||'';
    });
  }

  function renderWeb3Telemetry(data){
    const root=document.querySelector('[data-web3-telemetry]');if(!root)return;
    const valid=data?.schema_version==='kaufman-web3-telemetry-v1'&&Number.isFinite(ageMs(data.generated_at))&&ageMs(data.generated_at)<=172800000;
    const rows=valid?(data.profiles||[]):[];
    root.innerHTML=rows.length?rows.map((row)=>`<article class="${row.verification_status==='UNAVAILABLE'?'unavailable':''}"><span>${escapeHtml(row.layer)}</span><h3>${escapeHtml(row.name)}</h3><strong>${escapeHtml(row.metric||'No disponible')}</strong><small>${escapeHtml(row.detail||row.error||'Sin observación')}</small>${row.source_url?`<a href="${safeExternalUrl(row.source_url)}" target="_blank" rel="noopener noreferrer">Evidencia ↗</a>`:''}</article>`).join(''):'<div class="kf-live-empty">Telemetría no disponible; no se sustituye por información documental.</div>';
    root.title=data?.methodology||'';
  }

  function fiscalDataValid(data){
    const receivedAge=ageMs(data?.generated_at);
    return data?.schema_version==='kaufman-fiscal-intelligence-v1'&&Number.isFinite(receivedAge)&&receivedAge<=172800000;
  }

  function fiscalStatusLabel(status){
    return ({VERIFIED:'FUENTE OFICIAL',INTERPRETIVE:'INTERPRETATIVO',REVIEW_REQUIRED:'REVISIÓN NECESARIA',NOT_DETERMINED:'NO DETERMINADO'})[status]||status||'NO DISPONIBLE';
  }

  function fiscalSourceLinks(data,fact){
    const sourceById=Object.fromEntries((data?.sources||[]).map((source)=>[source.id,source]));
    return (fact?.source_ids||[]).map((id)=>sourceById[id]).filter(Boolean).map((source)=>`<a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(source.authority)}</span><strong>${escapeHtml(source.title)} ↗</strong><small>${escapeHtml(source.binding_level.replaceAll('_',' '))}${source.source_updated_at?` · ${escapeHtml(source.source_updated_at)}`:''}</small></a>`).join('');
  }

  function updateFiscalContextOptions(){
    const jurisdiction=document.querySelector('[data-fiscal-jurisdiction]')?.value||'espana';
    const select=document.querySelector('[data-fiscal-tax-context]');if(!select)return;
    const options={
      argentina:[['foreign_or_adjusted','Moneda extranjera o con ajuste · 15 %'],['local_unadjusted','Pesos sin ajuste · 5 %'],['foreign_source','Fuente extranjera · 15 %']],
      colombia:[['capital_asset','Activo fijo / inversión'],['ordinary_asset','Inventario, actividad o menos de 2 años']],
      mexico:[['art126_applicable','Aplicar supuesto general del art. 126'],['review','Pendiente de confirmar contraparte']]
    }[jurisdiction]||[['standard','Regla general oficial']];
    const signature=`${jurisdiction}:${options.map(([value])=>value).join(',')}`;if(select.dataset.options===signature)return;
    const previous=select.value;select.innerHTML=options.map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
    select.value=options.some(([value])=>value===previous)?previous:options[0][0];select.dataset.options=signature;
  }

  function fiscalProgressiveTax(amount,brackets){
    if(!Number.isFinite(amount)||amount<=0)return 0;
    let tax=0,lower=0;
    for(const bracket of brackets||[]){const upper=bracket.up_to==null?Infinity:Number(bracket.up_to);tax+=Math.max(0,Math.min(amount,upper)-lower)*Number(bracket.rate||0);if(amount<=upper)break;lower=upper}
    return tax;
  }

  function fiscalIncrementalTax(priorBase,gain,brackets){return Math.max(0,fiscalProgressiveTax(priorBase+gain,brackets)-fiscalProgressiveTax(priorBase,brackets))}
  function fiscalChileTax(amount,table){if(!Number.isFinite(amount)||amount<=0)return 0;const row=(table||[]).find((item)=>item.up_to==null||amount<=Number(item.up_to))||table?.at(-1);return row?Math.max(0,amount*Number(row.factor)-Number(row.rebate)):0}
  function fiscalEstimate(model,input){
    if(!model)return{status:'UNAVAILABLE',reason:'No existe un modelo cuantitativo conectado para esta jurisdicción.'};
    if(!(model.events||[]).includes(input.event))return{status:'INPUT_REQUIRED',reason:'Este evento requiere datos y calificación adicionales antes de calcular.'};
    if(input.profile==='company')return{status:'OUT_OF_SCOPE',reason:'El modelo cuantitativo cubre personas físicas, no sociedades.'};
    if(!Number.isFinite(input.proceeds)||!Number.isFinite(input.cost)||input.proceeds<0||input.cost<0)return{status:'INPUT_REQUIRED',reason:'Introduce el valor de salida y el coste fiscal ajustado para calcular.'};
    const gain=input.proceeds-input.cost,prior=Math.max(0,input.priorBase||0),rounded=(value)=>Math.round(Math.max(0,value)*100)/100;
    const done=(tax,extra={})=>{const taxEstimate=rounded(tax);return{status:'CALCULATED',currency:model.currency,gain,tax_estimate:taxEstimate,effective_rate:gain>0?taxEstimate/gain:0,result_label:model.result_label,source_ids:model.source_ids,exclusions:model.exclusions,...extra}};
    if(gain<=0)return done(0,{status:'NO_POSITIVE_GAIN',method:'No se calcula cuota positiva. El uso y compensación de la pérdida queda fuera del modelo.'});
    if(model.kind==='PROGRESSIVE_INCREMENTAL')return done(fiscalIncrementalTax(prior,gain,model.brackets),{method:'Diferencia entre la cuota de la base del ahorro con y sin esta ganancia.'});
    if(model.kind==='PORTUGAL_CRYPTO_2026'){
      if(input.event==='crypto_swap')return done(0,{status:'DEFERRED',method:'Permuta cripto a cripto: diferimiento bajo las condiciones del artículo 10.º.'});
      if(input.holdingDays>=model.long_holding_days)return done(0,{status:'CONDITIONAL_EXCLUSION',method:'Exclusión por tenencia mínima de 365 días, condicionada por activo y contraparte.'});
      if(prior+gain>=model.mandatory_aggregation_threshold)return done(fiscalIncrementalTax(prior,gain,model.general_brackets),{method:'Englobamiento obligatorio estimado al alcanzarse el último escalón.'});
      return done(gain*model.special_rate,{method:'Tasa especial del 28 % para saldo positivo de criptoactivos.'});
    }
    if(model.kind==='US_CAPITAL_GAIN_2026'){const filing=model.ordinary_brackets[input.filingStatus]?input.filingStatus:'single',long=input.holdingDays>365,brackets=long?model.long_term_brackets[filing]:model.ordinary_brackets[filing];return done(fiscalIncrementalTax(prior,gain,brackets),{method:`${long?'Ganancia de capital a largo plazo':'Ganancia a corto plazo como renta ordinaria'} · declaración ${filing}.`})}
    if(model.kind==='UAE_NATURAL_PERSON'){
      if(input.profile==='individual-investor')return done(0,{status:'PERSONAL_INVESTMENT_EXCLUDED',method:'Inversión personal fuera del Corporate Tax, bajo el perfil declarado.'});
      if(!Number.isFinite(input.turnover)||input.turnover<0)return{status:'INPUT_REQUIRED',reason:'Introduce el volumen de negocio anual para una actividad en EAU.'};
      if(input.turnover<=model.business_turnover_threshold)return done(0,{status:'BELOW_TURNOVER_THRESHOLD',method:'Volumen de negocio empresarial no superior a AED 1.000.000.'});
      const tax=(base)=>Math.max(0,base-model.zero_rate_threshold)*model.business_rate;return done(tax(prior+gain)-tax(prior),{method:'9 % sobre renta imponible que excede AED 375.000; turnover superior a AED 1.000.000.'});
    }
    if(model.kind==='ARGENTINA_CEDULAR'){const treatment=model.rates[input.taxContext]?input.taxContext:'foreign_or_adjusted',rate=model.rates[treatment];return done(gain*rate,{method:`${(rate*100).toLocaleString('es-ES')} % según fuente y moneda declaradas.`})}
    if(model.kind==='COLOMBIA_INCOME_2026'){
      if(input.holdingDays>=model.long_holding_days&&input.taxContext==='capital_asset')return done(gain*model.occasional_gain_rate,{method:'Ganancia ocasional estimada: activo fijo mantenido dos años o más.'});
      const priorUvt=prior/model.uvt_value,gainUvt=gain/model.uvt_value;return done(fiscalIncrementalTax(priorUvt,gainUvt,model.ordinary_brackets_uvt)*model.uvt_value,{method:`Renta ordinaria incremental · UVT 2026 = ${Number(model.uvt_value).toLocaleString('es-ES')} COP.`});
    }
    if(model.kind==='CHILE_IGC_2026')return done(Math.max(0,fiscalChileTax(prior+gain,model.annual_table)-fiscalChileTax(prior,model.annual_table)),{method:'Diferencia en IGC anual 2026. El coste introducido debe estar corregido monetariamente.'});
    if(model.kind==='MEXICO_PROVISIONAL_126')return done(input.proceeds*model.provisional_rate_on_gross,{status:'CONDITIONAL_PROVISIONAL',effective_rate:null,method:'20 % sobre el importe total como pago provisional si resulta aplicable el artículo 126. No es la cuota anual.'});
    if(model.kind==='UK_CGT_2026'){
      const taxable=Math.max(0,gain-model.annual_exempt_amount),basicCapacity=Math.max(0,model.basic_rate_band-prior),lower=Math.min(taxable,basicCapacity),higher=Math.max(0,taxable-lower);
      return done(lower*model.basic_rate+higher*model.higher_rate,{method:'Aplica el annual exempt amount de £3.000 y reparte la ganancia restante entre 18 % y 24 % según la capacidad declarada de la banda básica.'});
    }
    if(model.kind==='GERMANY_PRIVATE_DISPOSAL'){
      if(input.holdingDays>model.long_holding_days)return done(0,{status:'OUTSIDE_PRIVATE_DISPOSAL_WINDOW',method:'Tenencia superior a un año: la disposición privada queda fuera de §23 EStG bajo el perfil declarado.'});
      if(prior+gain<model.annual_exemption_threshold)return done(0,{status:'BELOW_ANNUAL_EXEMPTION_THRESHOLD',method:'La suma declarada de ganancias privadas permanece por debajo de la Freigrenze anual de €1.000.'});
      return{status:'INPUT_REQUIRED',reason:'La ganancia está dentro de un año y alcanza la Freigrenze: el tipo depende de la renta imponible total alemana. Kaufman no inventa una cuota.'};
    }
    return{status:'UNAVAILABLE',reason:'Modelo de cálculo no disponible.'};
  }

  function populateFiscalSelects(data){
    if(!fiscalDataValid(data))return;
    const signature=data.generated_at;
    const options=data.jurisdictions.map((row)=>`<option value="${escapeHtml(row.id)}">${escapeHtml(row.code)} · ${escapeHtml(row.name)}</option>`).join('');
    const assignments=[['[data-fiscal-jurisdiction]','espana'],['[data-fiscal-left]','espana'],['[data-fiscal-right]','portugal']];
    assignments.forEach(([selector,fallback])=>{
      const select=document.querySelector(selector);if(!select||select.dataset.snapshot===signature)return;
      const previous=select.value;
      select.innerHTML=options;
      select.value=data.jurisdictions.some((row)=>row.id===previous)?previous:fallback;
      select.dataset.snapshot=signature;
    });
    updateFiscalContextOptions();
  }

  function renderFiscalScenario(data){
    const root=document.querySelector('[data-fiscal-scenario-result]');if(!root)return;
    if(!fiscalDataValid(data)){root.innerHTML='<div class="kf-live-empty">Registro fiscal no disponible o revisión técnica superior a 48 horas.</div>';return}
    const jurisdictionId=document.querySelector('[data-fiscal-jurisdiction]')?.value||'espana';
    const eventId=document.querySelector('[data-fiscal-event]')?.value||'crypto_swap';
    const profile=document.querySelector('[data-fiscal-profile]')?.value||'individual-investor';
    const holdingDays=Number(document.querySelector('[data-fiscal-holding]')?.value);
    const proceedsRaw=document.querySelector('[data-fiscal-proceeds]')?.value?.trim()||'';
    const costRaw=document.querySelector('[data-fiscal-cost]')?.value?.trim()||'';
    const proceeds=proceedsRaw===''?NaN:Number(proceedsRaw),cost=costRaw===''?NaN:Number(costRaw);
    const priorBase=Number(document.querySelector('[data-fiscal-prior-base]')?.value)||0;
    const filingStatus=document.querySelector('[data-fiscal-filing-status]')?.value||'single';
    const taxContext=document.querySelector('[data-fiscal-tax-context]')?.value||'standard';
    const turnover=Number(document.querySelector('[data-fiscal-turnover]')?.value);
    const custody=document.querySelector('[data-fiscal-custody]')?.value||'self';
    const jurisdiction=data.jurisdictions.find((row)=>row.id===jurisdictionId)||data.jurisdictions[0];
    const event=data.events.find((row)=>row.id===eventId)||data.events[0];
    const fact=jurisdiction.facts[event.id];
    const outsideScope=profile==='company';
    const gainApplicable=['sell_fiat','crypto_swap'].includes(event.id)&&Number.isFinite(proceeds)&&Number.isFinite(cost)&&proceeds>=0&&cost>=0;
    const gain=gainApplicable?proceeds-cost:null;
    const estimate=fiscalEstimate(data.calculation_models?.[jurisdiction.id],{event:event.id,profile,holdingDays,proceeds,cost,priorBase,filingStatus,taxContext,turnover,custody});
    const estimateReady=Number.isFinite(estimate.tax_estimate);
    const estimateLabels={CALCULATED:'ESTIMACIÓN CALCULADA',NO_POSITIVE_GAIN:'SIN GANANCIA POSITIVA',DEFERRED:'DIFERIMIENTO ESTIMADO',CONDITIONAL_EXCLUSION:'EXCLUSIÓN CONDICIONADA',PERSONAL_INVESTMENT_EXCLUDED:'INVERSIÓN PERSONAL EXCLUIDA',BELOW_TURNOVER_THRESHOLD:'BAJO UMBRAL DE TURNOVER',CONDITIONAL_PROVISIONAL:'PAGO PROVISIONAL CONDICIONADO',OUTSIDE_PRIVATE_DISPOSAL_WINDOW:'FUERA DE LA VENTANA PRIVADA',BELOW_ANNUAL_EXEMPTION_THRESHOLD:'BAJO FREIGRENZE ANUAL'};
    let scenarioSignal=estimate.method||estimate.reason||'La regla oficial conectada se muestra sin calcular una deuda final.';
    if(jurisdiction.id==='espana'&&event.id==='holding'&&custody==='foreign')scenarioSignal='La custodia extranjera activa la revisión de localización y umbrales del Modelo 721.';
    if(outsideScope)scenarioSignal='El contrato conectado cubre personas físicas. No se extrapolan reglas de individuo a sociedades.';
    const calculation=estimateReady?`<section class="kf-fiscal-calculation ${escapeHtml(estimate.status.toLowerCase().replaceAll('_','-'))}"><header><div><span>RESULTADO REPRODUCIBLE · ${escapeHtml(data.calculation_models[jurisdiction.id].year)}</span><h4>${escapeHtml(estimate.result_label)}</h4></div><b>${escapeHtml(estimateLabels[estimate.status]||'ESTIMACIÓN INDICATIVA')}</b></header><div class="kf-fiscal-calculation-grid"><article><span>Ganancia introducida</span><strong>${Number(estimate.gain).toLocaleString('es-ES',{maximumFractionDigits:2})} ${escapeHtml(estimate.currency)}</strong></article><article class="primary"><span>${estimate.status==='CONDITIONAL_PROVISIONAL'?'Pago provisional':'Impacto fiscal incremental'}</span><strong>${Number(estimate.tax_estimate).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} ${escapeHtml(estimate.currency)}</strong></article><article><span>Tipo efectivo de esta operación</span><strong>${Number.isFinite(estimate.effective_rate)?`${(estimate.effective_rate*100).toLocaleString('es-ES',{maximumFractionDigits:2})} %`:'No equivale a tipo efectivo'}</strong></article><article><span>Base previa informada</span><strong>${priorBase.toLocaleString('es-ES',{maximumFractionDigits:2})} ${escapeHtml(estimate.currency)}</strong></article></div><div class="kf-fiscal-calculation-method"><span>MÉTODO APLICADO</span><strong>${escapeHtml(estimate.method)}</strong><small>Importes introducidos en ${escapeHtml(estimate.currency)}. No se realiza conversión de divisa.</small></div><div class="kf-fiscal-calculation-limits"><span>NO INCLUIDO</span><p>${(estimate.exclusions||[]).map(escapeHtml).join(' · ')}</p></div><div class="kf-fiscal-evidence">${fiscalSourceLinks(data,estimate)}</div></section>`:`<section class="kf-fiscal-calculation pending"><span>PARA OBTENER UNA CIFRA</span><h4>${escapeHtml(estimate.reason||'Faltan datos para aplicar el modelo oficial.')}</h4><p>Los importes deben introducirse en ${escapeHtml(jurisdiction.currency)}. Kaufman no inventa una base ni convierte divisas sin una cotización declarada.</p></section>`;
    root.innerHTML=`<header><div><span>${escapeHtml(jurisdiction.code)} · ${escapeHtml(event.label)} · importes en ${escapeHtml(jurisdiction.currency)}</span><h3>${escapeHtml(jurisdiction.name)}</h3></div><b class="${escapeHtml((outsideScope?'NOT_DETERMINED':fact.status).toLowerCase().replaceAll('_','-'))}">${outsideScope?'FUERA DE COBERTURA':fiscalStatusLabel(fact.status)}</b></header><div class="kf-fiscal-decision"><article><span>¿Activa hecho?</span><strong>${outsideScope?'No concluido':escapeHtml(fact.trigger)}</strong></article><article><span>Categoría</span><strong>${outsideScope?'Requiere contrato societario':escapeHtml(fact.category)}</strong></article><article><span>Mecanismo del tipo</span><strong>${outsideScope?'No se extrapola':escapeHtml(fact.rate)}</strong></article><article><span>Momento</span><strong>${outsideScope?'No determinado':escapeHtml(fact.timing)}</strong></article>${gainApplicable?`<article class="economic"><span>Diferencia económica</span><strong class="${gain>=0?'positive':'negative'}">${gain.toLocaleString('es-ES',{maximumFractionDigits:2})} ${escapeHtml(jurisdiction.currency)}</strong></article>`:''}</div>${calculation}<div class="kf-fiscal-scenario-signal ${outsideScope?'blocked':''}"><span>${outsideScope?'LÍMITE DE COBERTURA':'LECTURA DEL CÁLCULO'}</span><strong>${escapeHtml(scenarioSignal)}</strong></div><div class="kf-fiscal-result-bottom"><div><span>Reporte / evidencia</span><p>${escapeHtml(fact.reporting)}</p><span>Límite jurídico</span><p>${escapeHtml(fact.limitation)}</p></div><div class="kf-fiscal-evidence">${fiscalSourceLinks(data,fact)}</div></div>`;
  }

  function renderFiscalComparison(data){
    const root=document.querySelector('[data-fiscal-comparison]');if(!root)return;
    if(!fiscalDataValid(data)){root.innerHTML='<div class="kf-live-empty">Matriz fiscal no disponible.</div>';return}
    const left=data.jurisdictions.find((row)=>row.id===document.querySelector('[data-fiscal-left]')?.value)||data.jurisdictions[0];
    const right=data.jurisdictions.find((row)=>row.id===document.querySelector('[data-fiscal-right]')?.value)||data.jurisdictions[1];
    const event=data.events.find((row)=>row.id===document.querySelector('[data-fiscal-compare-event]')?.value)||data.events[0];
    const a=left.facts[event.id],b=right.facts[event.id],different=a.trigger!==b.trigger||a.category!==b.category;
    const rows=[['Hecho fiscal','trigger'],['Categoría','category'],['Tipo / mecanismo','rate'],['Momento','timing'],['Reporte','reporting'],['Limitación','limitation']];
    root.innerHTML=`<div class="kf-fiscal-difference ${different?'material':'aligned'}"><span>${different?'DIFERENCIA MATERIAL':'TRATAMIENTO APARENTEMENTE ALINEADO'}</span><strong>${different?`${escapeHtml(left.name)}: ${escapeHtml(a.trigger)} · ${escapeHtml(right.name)}: ${escapeHtml(b.trigger)}`:'Las etiquetas coinciden, pero deben compararse las limitaciones.'}</strong></div><div class="kf-fiscal-matrix"><div class="kf-fiscal-matrix-cell heading label">${escapeHtml(event.label)}</div><div class="kf-fiscal-matrix-cell heading"><strong>${escapeHtml(left.code)} · ${escapeHtml(left.name)}</strong><span class="${a.status.toLowerCase()}">${fiscalStatusLabel(a.status)}</span></div><div class="kf-fiscal-matrix-cell heading"><strong>${escapeHtml(right.code)} · ${escapeHtml(right.name)}</strong><span class="${b.status.toLowerCase()}">${fiscalStatusLabel(b.status)}</span></div>${rows.map(([label,key])=>`<div class="kf-fiscal-matrix-cell label">${label}</div><div class="kf-fiscal-matrix-cell">${escapeHtml(a[key])}</div><div class="kf-fiscal-matrix-cell">${escapeHtml(b[key])}</div>`).join('')}<div class="kf-fiscal-matrix-cell label">Fuentes</div><div class="kf-fiscal-matrix-cell sources">${fiscalSourceLinks(data,a)}</div><div class="kf-fiscal-matrix-cell sources">${fiscalSourceLinks(data,b)}</div></div>`;
  }

  function renderFiscalChanges(data){
    const root=document.querySelector('[data-fiscal-changes]');if(!root)return;
    if(!fiscalDataValid(data)){root.innerHTML='<div class="kf-live-empty">Radar fiscal no disponible.</div>';return}
    const sourceById=Object.fromEntries(data.sources.map((source)=>[source.id,source]));
    root.innerHTML=data.change_signals.map((signal,index)=>{const jurisdiction=data.jurisdictions.find((row)=>row.id===signal.jurisdiction),source=sourceById[signal.source_ids[0]];return `<article><span>${String(index+1).padStart(2,'0')}</span><time>${new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(signal.date+'T12:00:00Z'))}</time><div><small>${escapeHtml(jurisdiction?.name||signal.jurisdiction)} · ${escapeHtml(signal.confidence)}</small><h3>${escapeHtml(signal.title)}</h3><p>${escapeHtml(signal.impact)}</p></div>${source?`<a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.authority)} ↗</a>`:''}</article>`}).join('');
  }

  function renderFiscalQuality(data){
    document.querySelectorAll('[data-fiscal-quality]').forEach((node)=>{const value=data?.data_quality?.[node.dataset.fiscalQuality];node.textContent=fiscalDataValid(data)&&Number.isFinite(Number(value))?(node.dataset.fiscalQuality.includes('_pct')?`${Number(value).toLocaleString('es-ES',{maximumFractionDigits:1})} %`:Number(value).toLocaleString('es-ES')):'No disponible'});
    const root=document.querySelector('[data-fiscal-source-register]');if(!root)return;
    if(!fiscalDataValid(data)){root.innerHTML='<div class="kf-live-empty">Registro de fuentes no disponible.</div>';return}
    root.innerHTML=data.sources.map((source)=>`<div class="kf-fiscal-source-row"><i class="${source.connection_status.toLowerCase()}"></i><div><strong>${escapeHtml(source.authority)}</strong><span>${escapeHtml(source.title)}</span></div><small>${escapeHtml(source.binding_level.replaceAll('_',' '))}</small><small>${source.source_updated_at?escapeHtml(source.source_updated_at):'Fecha de fuente no publicada'}</small><a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">Abrir ↗</a></div>`).join('');
  }

  function renderFiscalIntelligence(snapshot){
    const dashboard=document.querySelector('[data-fiscal-dashboard]');if(!dashboard)return;
    const data=snapshot?.fiscal_intelligence,valid=fiscalDataValid(data);
    const status=document.querySelector('[data-fiscal-status]');
    if(status)status.textContent=valid?`Revisión jurídica ${new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(data.legal_reviewed_at+'T12:00:00Z'))} · registro server-side`:'Registro fiscal no disponible';
    if(!valid){renderFiscalScenario(data);return}
    populateFiscalSelects(data);
    document.querySelectorAll('[data-fiscal-kpi]').forEach((node)=>{const key=node.dataset.fiscalKpi,value=data.data_quality[key];node.textContent=Number.isFinite(Number(value))?(key.endsWith('_pct')?`${Number(value).toLocaleString('es-ES',{maximumFractionDigits:1})} %`:Number(value).toLocaleString('es-ES')):'—'});
    const reviewed=document.querySelector('[data-fiscal-reviewed]');if(reviewed)reviewed.textContent=new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(data.legal_reviewed_at+'T12:00:00Z'));
    if(dashboard.dataset.snapshot===data.generated_at)return;
    dashboard.dataset.snapshot=data.generated_at;
    renderFiscalScenario(data);renderFiscalComparison(data);renderFiscalChanges(data);renderFiscalQuality(data);
    const methodology=document.querySelector('[data-fiscal-methodology]');if(methodology)methodology.textContent=`${data.methodology} ${data.review_policy}`;
  }

  const REGULATION_ACTIVITY_LABELS={issuer:'Emisión',stablecoin:'Stablecoins',custody:'Custodia',exchange:'Exchange',brokerage:'Órdenes',transfer:'Transferencias',marketing:'Promoción',payments:'Pagos',advice:'Asesoramiento',banking:'Banca',lending:'Préstamo'};
  const REGULATION_REFERENCE_IDS=['mica-union-europea','dubai-vara','singapore-dpt','japan-crypto-exchange','hong-kong-vatp'];
  const REGULATION_SEARCH_ALIASES={'mica-union-europea':'MiCA ESMA EBA CASP','mica-espana-2026':'MiCA CNMV Banco de España CASP','mexico-activos-virtuales':'CNBV Banxico LRITF ITF','emiratos-payment-tokens':'CBUAE payment token','dubai-vara':'VARA VASP','uk-cryptoassets':'FCA MLR FSMA','hong-kong-vatp':'SFC AMLO VATP','japan-crypto-exchange':'FSA PSA','australia-vasp':'AUSTRAC AML CTF VASP','us-payment-stablecoins':'GENIUS Act payment stablecoin','brazil-vasp':'Brasil Brazil BCB VASP','argentina-psav':'Argentina CNV PSAV','el-salvador-psad':'El Salvador CNAD PSAD','chile-fintech-tokenized':'Chile CMF Fintech tokenizacion','colombia-no-general-license':'Colombia SFC cripto','uruguay-psav':'Uruguay BCU PSAV','peru-psav-aml':'Peru SBS UIF PSAV','singapore-dpt':'Singapore Singapur MAS DPT','south-korea-vasp':'Corea Korea KoFIU FSC VASP','thailand-digital-assets':'Tailandia Thailand SEC','indonesia-ojk-crypto':'Indonesia OJK','malaysia-digital-assets':'Malasia Malaysia SC','philippines-vasp':'Filipinas Philippines BSP','kazakhstan-aifc-datf':'Kazajistan Kazakhstan AIFC AFSA','panama-no-general-vasp':'Panama SBP VASP Centroamerica','costa-rica-no-general-vasp':'Costa Rica BCCR SUGEF VASP Centroamerica','israel-financial-asset-services':'Israel CMA ISA activo digital licencia','russia-crypto-market-2026':'Rusia Russia Bank of Russia criptomoneda','nigeria-sec-digital-assets':'Nigeria Africa SEC VASP ARIP'};

  function regulationStateLabel(state){
    return {TRANSITION_ENDED:'TRANSICIÓN FINALIZADA',ENACTED:'PROMULGADA',IN_FORCE_AND_TRANSITION:'EN VIGOR · CAMBIO PROGRAMADO',IN_FORCE:'EN VIGOR',NO_GENERAL_REGIME:'SIN LICENCIA GENERAL'}[state]||String(state||'ESTADO NO PUBLICADO').replaceAll('_',' ');
  }

  function regulationList(items){
    return `<ul>${(items||[]).map((item)=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function regulationSourceLinks(regime,sourcesById){
    return (regime.source_ids||[]).map((id)=>sourcesById.get(id)).filter(Boolean).map((source)=>`<a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(source.authority)}</span>${escapeHtml(source.title)} ↗</a>`).join('');
  }

  function regulationRowMarkup(regime,sourcesById){
    const activityText=(regime.regulated_activities||[]).join(' · ');
    const searchText=[regime.name,regime.jurisdiction,regime.authority,regime.framework_type,regime.market_access,REGULATION_SEARCH_ALIASES[regime.id],...(regime.applies_to||[]),...(regime.regulated_activities||[])].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const signedReview=regime.review_status==='SIGNED';
    const reviewLabel=signedReview?'Revisión jurídica firmada':regime.legal_reviewed_at?`Revisión editorial ${regime.legal_reviewed_at} · firma jurídica pendiente`:`Fuentes contrastadas ${regime.source_verified_at||'sin fecha'} · firma jurídica pendiente`;
    return `<article class="kf-reg-row" data-regulation-row data-id="${escapeHtml(regime.id)}" data-tags="${escapeHtml((regime.activity_tags||[]).join(' '))}" data-search="${escapeHtml(searchText)}"><button class="kf-reg-row-summary" type="button" aria-expanded="false" aria-controls="reg-detail-${escapeHtml(regime.id)}" data-regulation-toggle><span class="kf-reg-place"><b>${escapeHtml(regime.code)}</b><span><strong>${escapeHtml(regime.jurisdiction)}</strong><small>${escapeHtml(regime.framework_type)}</small></span></span><span class="kf-reg-who">${escapeHtml((regime.applies_to||[])[0]||regime.scope)}</span><span class="kf-reg-access"><i>${escapeHtml(regulationStateLabel(regime.state))}</i>${escapeHtml(regime.market_access)}</span><span class="kf-reg-activities">${escapeHtml(activityText)}</span><span class="kf-reg-open"><b>+</b><small>Abrir</small></span></button><div class="kf-reg-detail" id="reg-detail-${escapeHtml(regime.id)}" data-regulation-detail hidden><div class="kf-reg-detail-intro"><div><span>Autoridad</span><strong>${escapeHtml(regime.authority)}</strong></div><div><span>Fecha y estado</span><strong>${escapeHtml(regime.effective)}</strong></div><div><span>Perímetro</span><strong>${escapeHtml(regime.scope)}</strong></div></div><div class="kf-reg-detail-columns"><section><h3>A quién afecta</h3>${regulationList(regime.applies_to)}</section><section><h3>Qué no cubre</h3>${regulationList(regime.does_not_apply_to)}</section><section><h3>Obligaciones materiales</h3>${regulationList(regime.core_obligations)}</section><section><h3>Qué comprobar antes de operar</h3>${regulationList(regime.verification_steps)}</section></div><div class="kf-reg-detail-foot"><div><span>Efecto práctico</span><p>${escapeHtml(regime.practical_effect)}</p><span>Límite del dato</span><p>${escapeHtml(regime.limitation)}</p></div><div class="kf-reg-official-links"><span>Fuentes oficiales</span>${regulationSourceLinks(regime,sourcesById)}</div><small>${escapeHtml(reviewLabel)}</small></div></div></article>`;
  }

  function drawRegulationRows(){
    if(!regulationDataset)return;
    const root=document.querySelector('[data-regulation-regimes]');if(!root)return;
    const search=document.querySelector('[data-regulation-search]')?.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()||'';
    const activity=document.querySelector('[data-regulation-activity]')?.value||'all';
    const sourcesById=new Map(regulationDataset.sources.map((source)=>[source.id,source]));
    const matches=regulationDataset.regimes.filter((regime)=>{
      const haystack=[regime.name,regime.jurisdiction,regime.authority,regime.framework_type,regime.market_access,REGULATION_SEARCH_ALIASES[regime.id],...(regime.applies_to||[]),...(regime.regulated_activities||[])].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      return (!search||haystack.includes(search))&&(activity==='all'||(regime.activity_tags||[]).includes(activity));
    }).sort((left,right)=>left.jurisdiction.localeCompare(right.jurisdiction,'es',{sensitivity:'base'})||left.name.localeCompare(right.name,'es',{sensitivity:'base'}));
    const showingReferences=!search&&activity==='all'&&!regulationRowsExpanded;
    const rows=showingReferences?REGULATION_REFERENCE_IDS.map((id)=>matches.find((row)=>row.id===id)).filter(Boolean):matches;
    root.innerHTML=rows.length?rows.map((regime)=>regulationRowMarkup(regime,sourcesById)).join(''):'<div class="kf-reg-no-results">No hay un marco que coincida con esos filtros.</div>';
    const count=document.querySelector('[data-regulation-count]');if(count)count.textContent=showingReferences?`${rows.length} marcos completos de referencia`:`${rows.length} visibles de ${regulationDataset.regimes.length} marcos`;
    const expand=document.querySelector('[data-regulation-expand]');
    if(expand){
      expand.hidden=Boolean(search)||activity!=='all';
      expand.setAttribute('aria-expanded',String(regulationRowsExpanded));
      expand.textContent=regulationRowsExpanded?'Ver solo 5 jurisdicciones':`Ver las ${regulationDataset.regimes.length} jurisdicciones`;
    }
  }

  function drawRegulationComparison(){
    if(!regulationDataset)return;
    const root=document.querySelector('[data-regulation-comparison]');if(!root)return;
    const leftId=document.querySelector('[data-regulation-compare="left"]')?.value;
    const rightId=document.querySelector('[data-regulation-compare="right"]')?.value;
    const left=regulationDataset.regimes.find((row)=>row.id===leftId)||regulationDataset.regimes[0];
    const right=regulationDataset.regimes.find((row)=>row.id===rightId)||regulationDataset.regimes[1]||left;
    const cell=(items)=>regulationList(items);
    const lines=[
      ['Marco',left.framework_type,right.framework_type],
      ['Acceso al mercado',left.market_access,right.market_access],
      ['A quién afecta',cell(left.applies_to),cell(right.applies_to)],
      ['Qué no cubre',cell(left.does_not_apply_to),cell(right.does_not_apply_to)],
      ['Actividades',cell(left.regulated_activities),cell(right.regulated_activities)],
      ['Obligaciones',cell(left.core_obligations),cell(right.core_obligations)],
      ['Comprobación',cell(left.verification_steps),cell(right.verification_steps)]
    ];
    root.innerHTML=`<div class="kf-reg-compare-head"><span>Variable</span><strong>${escapeHtml(left.jurisdiction)}</strong><strong>${escapeHtml(right.jurisdiction)}</strong></div>${lines.map(([label,a,b])=>`<div class="kf-reg-compare-line"><span>${escapeHtml(label)}</span><div>${typeof a==='string'&&a.startsWith('<ul>')?a:escapeHtml(a)}</div><div>${typeof b==='string'&&b.startsWith('<ul>')?b:escapeHtml(b)}</div></div>`).join('')}`;
  }

  function initRegulationExplorer(){
    const dashboard=document.querySelector('[data-regulation-dashboard]');if(!dashboard||dashboard.dataset.explorerReady)return;
    dashboard.dataset.explorerReady='true';
    dashboard.addEventListener('click',(event)=>{
      const toggle=event.target.closest('[data-regulation-toggle]');if(!toggle)return;
      const row=toggle.closest('[data-regulation-row]'),detail=row?.querySelector('[data-regulation-detail]');if(!detail)return;
      const willOpen=toggle.getAttribute('aria-expanded')!=='true';
      dashboard.querySelectorAll('[data-regulation-toggle][aria-expanded="true"]').forEach((button)=>{button.setAttribute('aria-expanded','false');const current=button.closest('[data-regulation-row]')?.querySelector('[data-regulation-detail]');if(current)current.hidden=true});
      toggle.setAttribute('aria-expanded',String(willOpen));detail.hidden=!willOpen;
      if(willOpen&&window.matchMedia('(max-width: 760px)').matches)row.scrollIntoView({behavior:'smooth',block:'start'});
    });
    dashboard.querySelector('[data-regulation-search]')?.addEventListener('input',drawRegulationRows);
    dashboard.querySelector('[data-regulation-activity]')?.addEventListener('change',drawRegulationRows);
    dashboard.querySelector('[data-regulation-expand]')?.addEventListener('click',()=>{regulationRowsExpanded=!regulationRowsExpanded;drawRegulationRows()});
    dashboard.querySelectorAll('[data-regulation-compare]').forEach((select)=>select.addEventListener('change',drawRegulationComparison));
  }

  function renderRegulationIntelligence(snapshot){
    const dashboard=document.querySelector('[data-regulation-dashboard]');if(!dashboard)return;
    const data=snapshot?.regulation_intelligence;
    const valid=data?.schema_version==='kaufman-regulation-intelligence-v1'&&data?.source_contract_version===REGULATION_SOURCE_CONTRACT&&Array.isArray(data.regimes)&&Array.isArray(data.sources)&&data.regimes.length>0&&data.regimes.every((regime)=>Array.isArray(regime.applies_to)&&Array.isArray(regime.does_not_apply_to)&&Array.isArray(regime.core_obligations));
    const status=document.querySelector('[data-regulation-status]');
    if(!valid){if(status)status.textContent='Actualizando matriz regulatoria…';return}
    const currentSnapshot=Date.parse(dashboard.dataset.snapshot||''),incomingSnapshot=Date.parse(data.generated_at||'');
    if(Number.isFinite(currentSnapshot)&&Number.isFinite(incomingSnapshot)&&incomingSnapshot<currentSnapshot)return;
    const quality=data.data_quality||{},sourcesById=new Map(data.sources.map((source)=>[source.id,source]));
    const checked=Number(quality.checked_source_count)||0,sourceCount=Number(quality.source_count)||data.sources.length,reachable=Number(quality.reachable_source_count)||0;
    if(status)status.textContent=checked?`${reachable}/${sourceCount} fuentes oficiales accesibles · comprobación automática cada 24 h`:'Datos cargados · comprobando acceso a las fuentes';
    document.querySelectorAll('[data-reg-kpi]').forEach((node)=>{const value=quality[node.dataset.regKpi];node.textContent=Number.isFinite(Number(value))?Number(value).toLocaleString('es-ES'):'—'});
    const reachableNode=document.querySelector('[data-reg-reachable]');if(reachableNode)reachableNode.textContent=checked?`${reachable} / ${sourceCount}`:'Comprobando';
    const signed=document.querySelector('[data-reg-signed]');if(signed)signed.textContent=`${Number(quality.signed_regime_count||0).toLocaleString('es-ES')} / ${Number(quality.regime_count||data.regimes.length).toLocaleString('es-ES')}`;
    regulationDataset=data;
    initRegulationExplorer();
    drawRegulationRows();
    const orderedRegimes=[...data.regimes].sort((leftRegime,rightRegime)=>leftRegime.jurisdiction.localeCompare(rightRegime.jurisdiction,'es',{sensitivity:'base'})||leftRegime.name.localeCompare(rightRegime.name,'es',{sensitivity:'base'}));
    const options=orderedRegimes.map((regime)=>`<option value="${escapeHtml(regime.id)}">${escapeHtml(regime.jurisdiction)} · ${escapeHtml(regime.framework_type)}</option>`).join('');
    const left=document.querySelector('[data-regulation-compare="left"]'),right=document.querySelector('[data-regulation-compare="right"]');
    if(left&&left.dataset.snapshot!==data.generated_at){left.innerHTML=options;left.value=data.regimes.find((row)=>row.id==='mica-espana-2026')?.id||data.regimes[0].id;left.dataset.snapshot=data.generated_at}
    if(right&&right.dataset.snapshot!==data.generated_at){right.innerHTML=options;right.value=data.regimes.find((row)=>row.id==='uk-cryptoassets')?.id||data.regimes[1]?.id||data.regimes[0].id;right.dataset.snapshot=data.generated_at}
    drawRegulationComparison();
    if(dashboard.dataset.snapshot===data.generated_at)return;
    dashboard.dataset.snapshot=data.generated_at;
    const events=document.querySelector('[data-regulation-events]');
    if(events)events.innerHTML=data.events.map((event,index)=>{
      const source=sourcesById.get(event.source_ids?.[0]);
      const date=new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${event.effective_date}T12:00:00Z`));
      return `<article class="kf-reg-event"><span>${String(index+1).padStart(2,'0')}</span><time datetime="${escapeHtml(event.effective_date)}">${date}</time><div><strong>${escapeHtml(event.jurisdiction)} · ${escapeHtml(event.category)}</strong><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.impact)}</p></div>${source?`<a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.authority)} ↗</a>`:''}</article>`;
    }).join('');
    const sourceRoot=document.querySelector('[data-regulation-sources]');
    if(sourceRoot)sourceRoot.innerHTML=data.sources.map((source)=>{
      const connected=source.connection_status==='CONNECTED',pending=source.connection_status==='NOT_CHECKED';
      const state=pending?'Comprobación pendiente':connected?'Accesible':'Acceso fallido';
      const observed=source.checked_at?`Observada ${ageLabel(ageMs(source.checked_at))}`:'Sin comprobación técnica';
      const bindingLabel=REGULATION_LEVEL_LABELS[source.binding_level]||source.binding_level;
      return `<div class="kf-reg-source"><i class="${connected?'connected':pending?'pending':'offline'}"></i><strong>${escapeHtml(source.authority)}</strong><span>${escapeHtml(source.title)}</span><small>${escapeHtml(bindingLabel)} · ${escapeHtml(state)} · ${escapeHtml(observed)}</small><a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">Abrir ↗</a></div>`;
    }).join('');
    const sourceSummary=document.querySelector('[data-reg-source-summary]');if(sourceSummary)sourceSummary.textContent=`${reachable}/${sourceCount} accesibles · ${Number(quality.signed_regime_count||0)}/${Number(quality.regime_count||data.regimes.length)} con firma jurídica`;
    const methodology=document.querySelector('[data-regulation-methodology]');if(methodology)methodology.textContent=`${data.methodology} ${data.review_policy}`;
  }

  function loadRegulationFallback(){
    if(!document.querySelector('[data-regulation-dashboard]'))return Promise.resolve(null);
    if(window.KAUFMAN_REGULATION_DATA?.source_contract_version===REGULATION_SOURCE_CONTRACT){renderRegulationIntelligence({regulation_intelligence:window.KAUFMAN_REGULATION_DATA});return Promise.resolve(window.KAUFMAN_REGULATION_DATA)}
    if(regulationFallbackPromise)return regulationFallbackPromise;
    regulationFallbackPromise=new Promise((resolve)=>{
      if(!APP_SCRIPT){resolve(null);return}
      const script=document.createElement('script');
      script.src=dataAssetUrl('regulation-data.js');
      script.async=true;
      script.onload=()=>{const data=window.KAUFMAN_REGULATION_DATA||null;if(data)renderRegulationIntelligence({regulation_intelligence:data});resolve(data)};
      script.onerror=()=>resolve(null);
      document.head.appendChild(script);
    });
    return regulationFallbackPromise;
  }

  function applyHistoricalReturns(rows={}){
    document.querySelectorAll('[data-return-asset]').forEach((row)=>{
      const data=rows[row.dataset.returnAsset];
      for(const [period,key] of [['7d','change_7d_pct'],['30d','change_30d_pct'],['90d','change_90d_pct']]){
        const node=row.querySelector(`[data-return-period="${period}"]`),value=Number(data?.[key]);
        if(!node)continue;
        node.textContent=Number.isFinite(value)?`${value>=0?'+':''}${value.toLocaleString('es-ES',{maximumFractionDigits:2})} %`:'No disponible';
        node.classList.toggle('positive',Number.isFinite(value)&&value>0);
        node.classList.toggle('negative',Number.isFinite(value)&&value<0);
      }
      const status=row.querySelector('[data-return-status]');
      if(status)status.textContent=data?.observed_at?`Kraken OHLC · ${ageLabel(ageMs(data.observed_at))}`:'Histórico no disponible';
    });
  }

  function loadPlatformFallback(){
    if(window.KAUFMAN_PLATFORM_DATA){applyMarketSnapshot(window.KAUFMAN_PLATFORM_DATA);return Promise.resolve(window.KAUFMAN_PLATFORM_DATA)}
    if(platformFallbackPromise)return platformFallbackPromise;
    platformFallbackPromise=new Promise((resolve)=>{
      if(!APP_SCRIPT){resolve(null);return}
      const script=document.createElement('script');
      script.src=dataAssetUrl('platform-data.js');
      script.async=true;
      script.onload=()=>{const data=window.KAUFMAN_PLATFORM_DATA||null;if(data)applyMarketSnapshot(data);resolve(data)};
      script.onerror=()=>{document.querySelectorAll('[data-market-status],[data-tokenization-status],[data-l2-status],[data-fiscal-status],[data-wallet-release]').forEach((node)=>node.textContent='Snapshot público no disponible');resolve(null)};
      document.head.appendChild(script);
    });
    return platformFallbackPromise;
  }

  function applyMarketSnapshot(snapshot){
    latestMarketSnapshot=snapshot;
    refreshMarketDisplay();
    renderEcosystemMap(snapshot);
    renderProviders(snapshot.providers);
    renderStablecoins(snapshot.stablecoin_fx);
    renderDexPools(snapshot.onchain_pools);
    renderMetadata(snapshot.metadata);
    renderTokenizationMarkets(snapshot.tokenization_markets);
    renderTokenizationIntelligence(snapshot);
    renderL2Intelligence(snapshot.l2_intelligence);
    renderWalletIntelligence(snapshot.wallet_intelligence);
    renderWeb3Telemetry(snapshot.web3_telemetry);
    renderFiscalIntelligence(snapshot);
    renderRegulationIntelligence(snapshot);
    renderMarketContext(snapshot.market_context);
    applyHistoricalReturns(snapshot.historical_returns);
    applyGas(snapshot.auxiliary?.ethereum_gas);
    applyEthereumFees(snapshot.auxiliary?.ethereum_fees,snapshot.auxiliary?.etherscan_gas_oracle);
    const fee=snapshot.auxiliary?.exchange_fees;
    if(fee)applyExchangeFee(fee,`${fee.entries?.length||0} exchanges · ${snapshot.delivery_mode==='STATIC_SNAPSHOT'?'snapshot público':'server-side'} · ${ageLabel(ageMs(fee.received_at))}`);
    else document.querySelectorAll('[data-exchange-fee-status]').forEach((node)=>node.textContent='Tarifas no disponibles');
    const method=snapshot.reference_prices?.bitcoin?.methodology;
    document.querySelectorAll('[data-market-methodology]').forEach((node)=>node.textContent=method?(snapshot.delivery_mode==='STATIC_SNAPSHOT'?`Snapshot público · mediana de mercados observados · volumen mínimo ${Number(method.minimum_volume_usd_24h).toLocaleString('es-ES')} USD · divergencia ≤ ${method.divergence_threshold_pct} % · hora visible.`:`Mediana · frescura < 5 s · volumen mínimo ${Number(method.minimum_volume_usd_24h).toLocaleString('es-ES')} USD · divergencia ≤ ${method.divergence_threshold_pct} % · conexión sana.`):'Metodología pendiente');
    syncMiningReference();
  }

  function applyLiveMarketSnapshot(snapshot){
    if(!snapshot||!['LIVE_EDGE','LIVE_SSE_WEBSOCKET'].includes(snapshot.delivery_mode)||!snapshot.reference_prices)return false;
    const providers=Object.fromEntries(Object.entries(snapshot.providers||{}).map(([name,provider])=>{
      const contradictory=['LIVE','CONNECTED'].includes(provider?.connection_status)&&Boolean(provider?.last_error);
      return [name,contradictory?{...provider,connection_status:'DEGRADED'}:provider];
    }));
    latestMarketSnapshot={
      ...(latestMarketSnapshot||{}),
      schema_version:snapshot.schema_version,
      delivery_mode:snapshot.delivery_mode,
      generated_at:snapshot.generated_at,
      price_delivery_mode:snapshot.delivery_mode,
      price_generated_at:snapshot.generated_at,
      price_refresh_interval_ms:Number(snapshot.refresh_interval_ms)||3000,
      price_max_age_ms:Number(snapshot.thresholds?.fresh_ms)||5000,
      processing_ms:snapshot.processing_ms,
      status:snapshot.status,
      reference_prices:snapshot.reference_prices,
      stablecoin_fx:snapshot.stablecoin_fx||{},
      providers:{...(latestMarketSnapshot?.providers||{}),...providers},
      thresholds:{...(latestMarketSnapshot?.thresholds||{}),...(snapshot.thresholds||{})}
    };
    refreshMarketDisplay();
    renderProviders(latestMarketSnapshot.providers);
    renderStablecoins(latestMarketSnapshot.stablecoin_fx);
    renderEcosystemMap(latestMarketSnapshot);
    const method=latestMarketSnapshot.reference_prices?.bitcoin?.methodology;
    document.querySelectorAll('[data-market-methodology]').forEach((node)=>node.textContent=method?`Mediana de mercados frescos · volumen mínimo ${Number(method.minimum_volume_usd_24h).toLocaleString('es-ES')} USD · divergencia ≤ ${method.divergence_threshold_pct} % · proveedores consultados server-side.`:'Metodología pendiente');
    syncMiningReference();
    return true;
  }

  function applyAutomatedMarketSnapshot(snapshot){
    if(!snapshot||snapshot.delivery_mode!=='AUTOMATED_5_MINUTE_SNAPSHOT'||!snapshot.reference_prices)return false;
    const snapshotAge=ageMs(snapshot.generated_at);
    const maxAge=Number(snapshot.max_age_ms)||900000;
    const continuityMaxAge=Number(snapshot.continuity_max_age_ms)||MARKET_CONTINUITY_MAX_AGE_MS;
    if(!Number.isFinite(snapshotAge)||snapshotAge>continuityMaxAge)return false;
    const providers=Object.fromEntries(Object.entries(snapshot.providers||{}).map(([name,provider])=>{
      const contradictory=['LIVE','CONNECTED'].includes(provider?.connection_status)&&Boolean(provider?.last_error);
      return [name,contradictory?{...provider,connection_status:'DEGRADED'}:provider];
    }));
    latestMarketSnapshot={
      ...(latestMarketSnapshot||{}),
      schema_version:snapshot.schema_version,
      delivery_mode:snapshot.delivery_mode,
      generated_at:snapshot.generated_at,
      price_delivery_mode:snapshot.delivery_mode,
      price_generated_at:snapshot.generated_at,
      price_refresh_interval_ms:Number(snapshot.refresh_interval_ms)||300000,
      price_target_age_ms:maxAge,
      price_max_age_ms:continuityMaxAge,
      processing_ms:snapshot.processing_ms,
      status:snapshot.status,
      reference_prices:snapshot.reference_prices,
      stablecoin_fx:snapshot.stablecoin_fx||{},
      providers:{...(latestMarketSnapshot?.providers||{}),...providers},
      thresholds:{...(latestMarketSnapshot?.thresholds||{}),...(snapshot.thresholds||{})}
    };
    refreshMarketDisplay();
    renderProviders(latestMarketSnapshot.providers);
    renderStablecoins(latestMarketSnapshot.stablecoin_fx);
    renderEcosystemMap(latestMarketSnapshot);
    const method=latestMarketSnapshot.reference_prices?.bitcoin?.methodology;
    document.querySelectorAll('[data-market-methodology]').forEach((node)=>node.textContent=method?`Mediana de mercados aptos · cálculo server-side automático · objetivo 5 min · volumen mínimo ${Number(method.minimum_volume_usd_24h).toLocaleString('es-ES')} USD · divergencia ≤ ${method.divergence_threshold_pct} %.`:'Metodología pendiente');
    syncMiningReference();
    return true;
  }

  async function pollMarketEdge(){
    if(marketEdgeRequest||(document.hidden&&latestMarketSnapshot?.price_delivery_mode))return;
    marketEdgeRequest=(async()=>{
      try{
        const response=await fetch(pollingUrl(MARKET_EDGE_ENDPOINT,60000),{headers:{Accept:'application/json'},cache:'no-store'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const snapshot=await response.json();
        if(!applyLiveMarketSnapshot(snapshot)&&!applyAutomatedMarketSnapshot(snapshot))throw new Error('Respuesta de mercado no válida o fuera de plazo');
      }catch(error){
        refreshMarketDisplay();
      }finally{marketEdgeRequest=null}
    })();
    return marketEdgeRequest;
  }

  function startMarketEdgePolling(){
    if(marketEdgeTimer)return;
    pollMarketEdge();
    marketEdgeTimer=window.setInterval(pollMarketEdge,60000);
  }

  async function pollMarketContext(){
    if(marketContextRequest||document.hidden||!document.querySelector('[data-market-context]'))return;
    marketContextRequest=(async()=>{
      try{
        const response=await fetch(pollingUrl(MARKET_CONTEXT_ENDPOINT,300000),{headers:{Accept:'application/json'},cache:'no-store'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const context=await response.json();
        if(!['LIVE_EDGE_CONTEXT','STATIC_DAILY_FALLBACK'].includes(context?.delivery_mode))throw new Error('Respuesta de contexto no válida');
        const fallbackEtf=latestMarketSnapshot?.market_context?.etf_flows;
        const liveEtf=context.etf_flows;
        const etfFlows=liveEtf?{
          ...liveEtf,
          issuer_observations:liveEtf.issuer_observations?.length?liveEtf.issuer_observations:(fallbackEtf?.issuer_observations||[]),
          reconciliation:liveEtf.reconciliation||fallbackEtf?.reconciliation,
          assets:Object.fromEntries(['bitcoin','ethereum'].map((asset)=>{
            const liveRow=liveEtf.assets?.[asset]||{};
            const fallbackRow=fallbackEtf?.assets?.[asset]||{};
            return [asset,{...fallbackRow,...liveRow,issuer_observation:liveRow.issuer_observation||fallbackRow.issuer_observation}];
          }))
        }:fallbackEtf;
        const mergedContext={...context,etf_flows:etfFlows};
        latestMarketSnapshot={...(latestMarketSnapshot||{}),market_context:mergedContext};
        renderMarketContext(mergedContext);
      }catch(error){}finally{marketContextRequest=null}
    })();
    return marketContextRequest;
  }

  function startMarketContextPolling(){
    if(marketContextTimer||!document.querySelector('[data-market-context]'))return;
    pollMarketContext();
    marketContextTimer=window.setInterval(pollMarketContext,300000);
  }

  async function pollGasEdge(){
    if(gasEdgeRequest||document.hidden||!document.querySelector('[data-gas-base]'))return;
    gasEdgeRequest=(async()=>{
      try{
        const response=await fetch(pollingUrl(GAS_EDGE_ENDPOINT,60000),{headers:{Accept:'application/json'},cache:'no-store'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const payload=await response.json();
        if(!payload?.ethereum_fees)throw new Error('Respuesta de gas no válida');
        applyEthereumFees(payload.ethereum_fees,null,Number(payload.refresh_interval_ms)||60000);
      }catch(error){}finally{gasEdgeRequest=null}
    })();
    return gasEdgeRequest;
  }

  function startGasEdgePolling(){
    if(gasEdgeTimer||!document.querySelector('[data-gas-base]'))return;
    pollGasEdge();
    gasEdgeTimer=window.setInterval(pollGasEdge,30000);
  }

  function activateEcosystemTerritory(territoryId,{pin=false}={}){
    const root=document.querySelector('[data-ecosystem]');
    if(!root||!ECOSYSTEM_TERRITORIES[territoryId])return;
    if(pin)ecosystemPinned=territoryId;
    const canvas=root.querySelector('.kf-eco-canvas'),panel=root.querySelector('[data-eco-panel]');
    if(canvas)canvas.dataset.ecoCurrent=territoryId;
    root.querySelectorAll('[data-eco-territory]').forEach((button)=>{
      const active=button.dataset.ecoTerritory===territoryId;
      button.classList.toggle('active',active);
      button.setAttribute('aria-selected',String(active));
    });
    if(panel){panel.setAttribute('aria-labelledby',`ecosystem-tab-${territoryId}`);panel.innerHTML=plainLanguage(ecosystemPanelMarkup(territoryId,latestMarketSnapshot));localizeRenderedLinks(panel)}
  }

  function renderEcosystemMap(snapshot){
    const root=document.querySelector('[data-ecosystem]');
    if(!root)return;
    const connectedProviders=Object.values(snapshot?.providers||{}).filter((provider)=>['LIVE','CONNECTED','SNAPSHOT'].includes(provider?.connection_status)).length;
    document.querySelectorAll('[data-engine-state]').forEach((node)=>node.innerHTML=`<i></i> ${connectedProviders||'—'} fuentes activas`);
    const references=Object.values(snapshot?.reference_prices||{});
    const regulation=snapshot?.regulation_intelligence||{};
    const fiscal=snapshot?.fiscal_intelligence||{};
    const signals={
      market:`${references.filter((item)=>item?.verification_status==='VERIFIED').length} PRECIOS DE REFERENCIA`,
      regulation:`${regulation?.events?.length??0} CAMBIOS REGULATORIOS`,
      fiscal:`${fiscal?.data_quality?.source_count??0} FUENTES FISCALES`
    };
    for(const [key,value] of Object.entries(signals)){const node=root.querySelector(`[data-eco-signal="${key}"]`);if(node)node.textContent=value}
    activateEcosystemTerritory(ecosystemPinned);
  }

  function initEcosystemMap(){
    const root=document.querySelector('[data-ecosystem]');
    if(!root)return;
    const canvas=root.querySelector('.kf-eco-canvas'),buttons=[...root.querySelectorAll('[data-eco-territory]')];
    buttons.forEach((button,index)=>{
      const territoryId=button.dataset.ecoTerritory;
      button.addEventListener('pointerenter',()=>activateEcosystemTerritory(territoryId));
      button.addEventListener('focus',()=>activateEcosystemTerritory(territoryId));
      button.addEventListener('click',()=>activateEcosystemTerritory(territoryId,{pin:true}));
      button.addEventListener('keydown',(event)=>{
        if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key))return;
        event.preventDefault();
        let next=index;
        if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%buttons.length;
        if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index-1+buttons.length)%buttons.length;
        if(event.key==='Home')next=0;
        if(event.key==='End')next=buttons.length-1;
        buttons[next].focus();
      });
    });
    canvas?.addEventListener('pointerleave',()=>activateEcosystemTerritory(ecosystemPinned));
    activateEcosystemTerritory(ecosystemPinned);
  }

  async function connectMarketAntenna(){
    if(!document.querySelector('[data-market-asset],[data-gas-price],[data-gas-base],[data-l2-projects],[data-tokenization-dashboard],[data-fiscal-dashboard],[data-regulation-dashboard],[data-wallet-release],[data-web3-telemetry],[data-exchange-fee-rows],[data-provider-grid]'))return;
    if(document.querySelector('[data-wallet-release],[data-web3-telemetry]')&&!document.querySelector('[data-market-asset],[data-gas-price],[data-gas-base],[data-l2-projects],[data-tokenization-dashboard],[data-fiscal-dashboard],[data-regulation-dashboard],[data-exchange-fee-rows],[data-provider-grid]')){
      await loadPlatformFallback();
      return;
    }
    if(marketEdgeTimer){window.clearInterval(marketEdgeTimer);marketEdgeTimer=null}
    await loadPlatformFallback();
    document.querySelectorAll('[data-market-status]').forEach((node)=>node.textContent='Comprobando actualización automática…');
    refreshMarketDisplay();
    startMarketEdgePolling();
  }

  function safeExternalUrl(value){
    try{const url=new URL(value);return url.protocol==='https:'?url.href:'#'}catch(error){return '#'}
  }

  function feedItemMarkup(item,index=0){
    const url=safeExternalUrl(item.url),status=['verified','sourcechecked'].includes(item.status)?item.status:'unverified';
    const title=String(item.title||'').replace(/\s*[:·]\s*fuente oficial comprobada hoy\.?\s*$/iu,'');
    const translation=item.translated?'<span>Traducido al castellano · titular original en la fuente</span>':'';
    const statusCopy=item.verification_status==='CALCULATED_FROM_PUBLIC_SOURCES'?'Cálculo conectado':item.verification_status==='OFFICIAL_SOURCE_MONITORED'?'Fuente oficial monitorizada':({verified:'Fuente primaria',sourcechecked:'Fuente contrastada',unverified:'Cobertura periodística'}[status]);
    return `<article class="kf-feed-item no-time ${index===0?'lead':'secondary'}"><div class="kf-feed-body"><div class="kf-feed-meta"><span>${escapeHtml(item.jurisdiction||'Global')}</span><span>${escapeHtml(item.category||'ACTUALIDAD')}</span></div><a class="kf-feed-title" href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a><p>${escapeHtml(item.publisher)}</p><div class="kf-feed-context">${translation}<span class="kf-feed-verification ${status}"><i></i>${escapeHtml(statusCopy)}</span><a href="${url}" target="_blank" rel="noopener noreferrer">Abrir fuente ↗</a></div></div><button class="kf-feed-star" type="button" data-feed-star data-feed-key="${escapeHtml(url)}" aria-label="Guardar referencia" title="Guardar referencia">☆</button></article>`;
  }

  function renderHomeCurrentAffairs(data){
    const regulationRoot=document.querySelector('[data-home-regulation]');
    if(regulationRoot){
      const regulation=(data?.home_regulation||[]).slice(0,3);
      const cards=regulation.map(feedItemMarkup).join('');
      const missing=3-regulation.length;
      regulationRoot.innerHTML=`<div class="kf-feed-list kf-editorial-feed">${cards}${missing>0?`<div class="kf-live-empty">${missing===3?'No hay referencias regulatorias verificadas disponibles.':`Faltan ${missing} referencias verificadas.`}</div>`:''}</div>`;
    }

    const miningRoot=document.querySelector('[data-home-mining]');
    if(!miningRoot)return;
    const news=(data?.mining_news||[]).slice(0,2);
    const newsCards=news.map(feedItemMarkup).join('');
    const missingNews=2-news.length;
    const metrics=data?.mining_profitability;
    let metricsMarkup='<div class="kf-live-empty">Cálculo minero no disponible.</div>';
    if(metrics?.status==='auto'){
      const hardware=metrics.hardware||{};
      const gross=Number(metrics.gross_usd_day),breakEven=Number(metrics.break_even_usd_kwh),network=Number(metrics.network_hashrate_eh_s);
      const priceSourceUrl=String(metrics.price_source_url||'').startsWith('/')?internalUrl(metrics.price_source_url):safeExternalUrl(metrics.price_source_url);
      metricsMarkup=`<aside class="kf-mining-metrics"><div class="kf-mining-metrics-head"><div><span>Referencia de rentabilidad</span><h3>${escapeHtml(hardware.model)}</h3></div>${statusBadge('auto')}</div><div class="kf-mining-kpis"><div><span>Ingreso bruto / día</span><strong data-mining-gross>${Number.isFinite(gross)?PRICE.format(gross):'—'}</strong></div><div><span>Electricidad de equilibrio</span><strong data-mining-break-even>${Number.isFinite(breakEven)?`${SMALL_USD.format(breakEven)}/kWh`:'—'}</strong></div><div><span>Hashrate de red</span><strong>${Number.isFinite(network)?`${network.toFixed(1)} EH/s`:'—'}</strong></div></div><div class="kf-hardware-spec"><span>Equipo de referencia</span><strong>${Number(hardware.hashrate_th_s).toLocaleString('es-ES')} TH/s · ${Number(hardware.power_w).toLocaleString('es-ES')} W</strong><a href="${safeExternalUrl(hardware.source_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(hardware.source)} ↗</a></div><details class="kf-mining-method"><summary>Ver método y fuentes</summary><p>Recompensa media de 144 bloques y ritmo de bloque observado; incluye subsidio y comisiones de transacción. No incluye comisión de pool, paradas, refrigeración, impuestos ni coste eléctrico.</p><div class="kf-metric-sources"><a href="${safeExternalUrl(metrics.network_source_url)}" target="_blank" rel="noopener noreferrer">mempool.space ↗</a><a href="${priceSourceUrl}" rel="noopener noreferrer" data-mining-price-source>${escapeHtml(metrics.price_source||'Referencia de precio')} ↗</a></div></details></aside>`;
    }
    miningRoot.innerHTML=`<div class="kf-feed-list compact kf-editorial-feed">${newsCards}${missingNews>0?`<div class="kf-live-empty">${missingNews===2?'No hay datos mineros verificados disponibles.':`Falta ${missingNews} referencia minera verificada.`}</div>`:''}</div>`;
    const metricsRoot=document.querySelector('[data-home-mining-metrics]');
    if(metricsRoot)metricsRoot.innerHTML=metricsMarkup;
    syncMiningReference();
    syncFeedStars();
  }

  function applyDailySnapshot(data){
    renderHomeCurrentAffairs(data);
    updateMiningCalculator(data?.mining_profitability);
    const radar=document.querySelector('[data-regulation-radar]');
    if(!radar)return;
    const sources=(data?.regulation?.sources||[]).map((source)=>`<div class="kf-source-row"><strong>${escapeHtml(source.name)}</strong><span>${escapeHtml(source.scope)}</span><span>${source.status==='auto'?'Fuente conectada':'Fuente no disponible'}</span><div>${statusBadge(source.status==='auto'?'auto':'offline')} <a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">Abrir ↗</a></div></div>`).join('');
    const items=(data?.regulation?.items||[]).map((item)=>`<a class="kf-regulation-item" href="${safeExternalUrl(item.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(item.source)} · ${escapeHtml(item.jurisdiction)}</span><strong>${escapeHtml(item.title)}</strong><small>Publicado ${escapeHtml(item.published)}</small></a>`).join('');
    radar.innerHTML=`<div class="kf-source-register">${sources}</div>${items?`<div class="kf-regulation-feed">${items}</div>`:'<div class="kf-live-empty">Sin coincidencias relacionadas con blockchain en el periodo analizado.</div>'}`;
  }

  function loadDailySnapshot(){
    if(window.KAUFMAN_DAILY_DATA){applyDailySnapshot(window.KAUFMAN_DAILY_DATA);return Promise.resolve(window.KAUFMAN_DAILY_DATA)}
    if(!APP_SCRIPT)return Promise.resolve(null);
    return new Promise((resolve)=>{
      const script=document.createElement('script');
      script.src=dataAssetUrl('daily-data.js');
      script.async=true;
      script.onload=()=>{applyDailySnapshot(window.KAUFMAN_DAILY_DATA);resolve(window.KAUFMAN_DAILY_DATA||null)};
      script.onerror=()=>{document.querySelectorAll('[data-home-regulation],[data-home-mining],[data-home-mining-metrics],[data-regulation-radar]').forEach((node)=>node.innerHTML='<div class="kf-live-empty">Fuente diaria no disponible.</div>');updateMiningCalculator(null);resolve(null)};
      document.head.appendChild(script);
    });
  }

  function initReveal(){
    const items=document.querySelectorAll('[data-reveal]');
    if(!('IntersectionObserver' in window)){items.forEach((item)=>item.classList.add('visible'));return}
    const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.07});
    items.forEach((item)=>observer.observe(item));
  }

  function loadAnalytics(){
    if(window.__kaufmanAnalyticsLoaded)return;
    window.__kaufmanAnalyticsLoaded=true;
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
    const gtm=document.createElement('script');gtm.async=true;gtm.src='https://www.googletagmanager.com/gtm.js?id=GTM-K8LDMZ69';document.head.appendChild(gtm);
    const ga=document.createElement('script');ga.async=true;ga.src='https://www.googletagmanager.com/gtag/js?id=G-217HQ31S3E';document.head.appendChild(ga);
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config','G-217HQ31S3E');
    const goat=document.createElement('script');goat.async=true;goat.dataset.goatcounter='https://kaufman.goatcounter.com/count';goat.src='https://gc.zgo.at/count.js';document.head.appendChild(goat);
  }

  function clearAnalyticsCookies(){
    const host=location.hostname.replace(/^www\./,'');
    const domains=['',host,`.${host}`];
    document.cookie.split(';').map((item)=>item.split('=')[0].trim()).filter((name)=>/^(_ga|_gid|_gat|__utm)/.test(name)).forEach((name)=>{
      domains.forEach((domain)=>{document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax${domain?`; domain=${domain}`:''}`});
    });
  }

  function initConsent(){
    document.querySelector('[data-consent-manage]')?.addEventListener('click',()=>{try{window.localStorage.removeItem('kaufman_analytics_consent')}catch(error){}clearAnalyticsCookies();window.location.reload()});
    let preference=null;
    try{preference=window.localStorage.getItem('kaufman_analytics_consent')}catch(error){preference=null}
    if(preference==='accepted'){loadAnalytics();return}
    if(preference==='rejected')return;
    const banner=document.createElement('aside');
    banner.className='kf-consent';
    banner.setAttribute('aria-label','Preferencias de analítica');
    banner.innerHTML=`<div><strong>Analítica opcional</strong><p>Kaufman usa GA4, GTM y GoatCounter para medir el uso. No se activan hasta que aceptes y puedes continuar si rechazas. <a href="${internalUrl('/politica-cookies.html')}">Política de cookies</a>.</p></div><div class="kf-consent-actions"><button class="kf-button small secondary" type="button" data-consent-reject>Rechazar</button><button class="kf-button small primary" type="button" data-consent-accept>Aceptar</button></div>`;
    document.body.appendChild(banner);
    const decide=(value)=>{try{window.localStorage.setItem('kaufman_analytics_consent',value)}catch(error){}banner.remove();if(value==='accepted')loadAnalytics();else clearAnalyticsCookies()};
    banner.querySelector('[data-consent-accept]').addEventListener('click',()=>decide('accepted'));
    banner.querySelector('[data-consent-reject]').addEventListener('click',()=>decide('rejected'));
  }

  function initContact(){
    const button=document.querySelector('[data-contact-copy]');
    if(!button)return;
    const status=document.querySelector('[data-contact-copy-status]');
    button.addEventListener('click',async()=>{
      const value=button.dataset.copyValue||'';
      let copied=false;
      try{await navigator.clipboard.writeText(value);copied=true}catch(error){}
      if(!copied){
        const address=document.querySelector('.kf-contact-address a');
        if(address){const range=document.createRange();range.selectNodeContents(address);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range)}
      }
      if(status)status.textContent=copied?'Correo copiado.':'Correo seleccionado. Pulsa Ctrl+C para copiarlo.';
      if(copied){button.textContent='Copiado';window.setTimeout(()=>{button.textContent='Copiar correo';if(status)status.textContent=''},2200)}
    });
  }

  function initDecisionBrief(){
    const form=document.querySelector('[data-decision-builder]');
    if(!form)return;
    const operation=form.querySelector('[data-decision-operation]');
    const jurisdiction=form.querySelector('[data-decision-jurisdiction]');
    const scenarios={
      operar:{verb:'Operar o invertir',summary:'Comprueba tratamiento fiscal, proveedor, coste total, custodia y condiciones de salida antes de ejecutar.',checks:['Hecho fiscal y obligación de información','Autorización del proveedor','Coste total, custodia y salida'],route:'/fiscal/'},
      tokenizar:{verb:'Tokenizar un activo',summary:'Delimita vehículo, derechos, jurisdicción, red, distribución y custodia antes de diseñar la emisión.',checks:['Naturaleza jurídica del activo','Vehículo, derechos e inversores','Red, custodia y distribución'],route:'/tokenizacion/'},
      custodiar:{verb:'Elegir custodia',summary:'Contrasta control de claves, entidad contractual, recuperación, segregación y superficie operativa.',checks:['Entidad, licencia y contrato','Control y segregación de claves','Recuperación, incidentes y salida'],route:'/wallets/'},
      infraestructura:{verb:'Seleccionar infraestructura Web3',summary:'Compara disponibilidad, coste, upgrades, secuenciación, datos y capacidad de salida.',checks:['Dependencias y control de upgrades','Disponibilidad de datos y salida','Coste, capacidad y continuidad'],route:'/mercados/'},
      mineria:{verb:'Evaluar una operación minera',summary:'Cruza hardware, electricidad, red, disponibilidad, fiscalidad y sensibilidad de la rentabilidad.',checks:['Equipo, stock y rendimiento','Electricidad y coste operativo','Fiscalidad, red y sensibilidad'],route:'/mineria/#economia-minera'}
    };
    const jurisdictions={ES:'España',UE:'la Unión Europea',US:'Estados Unidos',GB:'Reino Unido',AE:'Emiratos Árabes Unidos',CH:'Suiza',SG:'Singapur',MX:'México'};
    const update=()=>{
      const scenario=scenarios[operation.value]||scenarios.operar;
      const territory=jurisdictions[jurisdiction.value]||jurisdiction.value;
      form.querySelector('[data-decision-title]').textContent=`${scenario.verb} desde ${territory}`;
      form.querySelector('[data-decision-summary]').textContent=scenario.summary;
      form.querySelector('[data-decision-checks]').innerHTML=scenario.checks.map((item)=>`<li>${escapeHtml(item)}</li>`).join('');
      form.querySelector('[data-decision-public]').setAttribute('href',scenario.route);
      form.querySelector('[data-decision-contact]').setAttribute('href',`/contacto/?asunto=decision-brief&operacion=${encodeURIComponent(operation.value)}&jurisdiccion=${encodeURIComponent(jurisdiction.value)}`);
      localizeRenderedLinks(form);
    };
    operation.addEventListener('change',update);
    jurisdiction.addEventListener('change',update);
    form.addEventListener('submit',(event)=>event.preventDefault());
    update();
  }

  function arrangeMarketsTop(){
    if(page!=='mercados')return;
    const main=document.querySelector('#main-content');
    main?.querySelector('.kf-rwa-market .kf-rwa-kpis')?.remove();
    main?.querySelector('.kf-rwa-market .kf-rwa-ratios')?.remove();
    const hero=main?.querySelector('.kf-page-hero');
    const priceBand=main?.querySelector('.kf-market-band');
    const metadataGrid=main?.querySelector('[data-market-metadata]');
    const metadataHead=metadataGrid?.previousElementSibling;
    const priceCells=[...(priceBand?.querySelectorAll('.kf-market-cell')||[])];
    if(!hero||!priceBand||!metadataGrid||!metadataHead||priceCells.length!==2)return;
    priceCells.forEach((cell)=>{
      const slot=document.createElement('div');
      slot.className='kf-market-metadata-slot';
      slot.dataset.marketMetadataSlot=cell.dataset.marketAsset;
      slot.innerHTML='<div class="kf-live-empty">Cargando capitalización y oferta…</div>';
      cell.append(slot);
    });
    metadataHead.remove();
    metadataGrid.remove();
    const referenceTable=main.querySelector('.kf-reference-table');
    const methodologyContainer=referenceTable?.closest('.kf-section')?.querySelector(':scope > .kf-container');
    const contextHead=methodologyContainer?.querySelector(':scope > .kf-section-head:not(.kf-spaced-head)');
    const contract=methodologyContainer?.querySelector(':scope > .kf-antenna-contract');
    const referenceWrap=referenceTable?.closest('.kf-data-table-wrap');
    const methodStrip=methodologyContainer?.querySelector(':scope > .kf-method-strip');
    [contextHead,contract,referenceWrap,methodStrip].forEach((node)=>node?.remove());
    const providerGrid=main.querySelector('[data-provider-grid]');
    const providerHead=providerGrid?.previousElementSibling;
    providerHead?.remove();
    providerGrid?.remove();
    hero.insertAdjacentElement('afterend',priceBand);
  }

  const page=new URLSearchParams(location.search).get('pagina')||document.body.dataset.page||'home';
  const app=document.getElementById('kaufman-app');
  const commercialPages=!['home','regulacion','wallets','contacto','aviso','privacidad','cookies','terminos','retirado'].includes(page);
  const renderedPage=plainLanguage(renderPage(page));
  const pageWithClose=plainLanguage(commercialPages?renderedPage.replace('</main>',`${decisionCloseMarkup(page)}</main>`):renderedPage);
  app.innerHTML=`<div class="kf-shell">${headerMarkup(page)}${pageWithClose}${footerMarkup()}</div>${searchOverlayMarkup()}`;
  arrangeMarketsTop();
  localizeRenderedLinks(app);
  const pageTitle=page==='home'?'Kaufman | Inteligencia blockchain':`${CATALOGS[page]?.label||({mercados:'Mercados',tokenizacion:'Tokenización',ficha:'Ficha',fuentes:'Fuentes',contacto:'Contacto',aviso:'Aviso legal',privacidad:'Política de privacidad',cookies:'Política de cookies',terminos:'Términos de uso'}[page]||'Kaufman')} | Kaufman`;
  document.title=pageTitle;
  initMenu();initSearch();initDirectoryFilters();initBankRegistry();initTokenizationFilters();initFiscalDashboard();initComparator();initFeedStars();initMiningCalculator();initMiningDashboard();initJurisdictionTool();initCountryCostStack();initEcosystemMap();initDecisionBrief();initContact();initReveal();
  Promise.resolve(connectMarketAntenna()).finally(()=>{startMarketContextPolling();startGasEdgePolling()});
  loadRegulationFallback();
  if(document.querySelector('[data-market-asset]'))window.setInterval(refreshMarketDisplay,1000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)return;if(marketEdgeTimer)pollMarketEdge();if(marketContextTimer)pollMarketContext();if(gasEdgeTimer)pollGasEdge()});
  loadDailySnapshot();
  initConsent();
})();
