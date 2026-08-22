(() => {
  'use strict';

  const ROUTES = [
    {key:'mercados',label:'Mercados',path:'/mercados/',code:'DATA',description:'Precios, variaciones, gas y métricas conectadas.',tone:'auto'},
    {key:'regulacion',label:'Regulación',path:'/regulacion/',code:'LAW',description:'Leyes, consultas y guías por estado jurídico.',tone:'verified'},
    {key:'tokenizacion',label:'Tokenización',path:'/tokenizacion/',code:'RWA',description:'Entidades, iniciativas, redes y madurez verificable.',tone:'auto'},
    {key:'herramientas',label:'Herramientas',path:'/herramientas/',code:'TOOLS',description:'Cálculo minero, cruce fiscal y alertas de disponibilidad.',tone:'auto'},
    {key:'empresas',label:'Empresas',path:'/empresas/',code:'CORP',description:'Actividad, exposición y proyectos blockchain.',tone:'auto'},
    {key:'bancos',label:'Bancos',path:'/bancos/',code:'BANK',description:'Custodia, pagos, tokenización y acceso.',tone:'verified'},
    {key:'exchanges',label:'Exchanges',path:'/exchanges/',code:'CEX',description:'Jurisdicción, licencias, comisiones y custodia.',tone:'auto'},
    {key:'wallets',label:'Wallets',path:'/wallets/',code:'KEYS',description:'Custodia, redes, seguridad y compatibilidad.',tone:'auto'},
    {key:'proyectos',label:'Proyectos',path:'/proyectos/',code:'BUILD',description:'Redes, protocolos, actividad y gobernanza.',tone:'auto'},
    {key:'mineria',label:'Minería',path:'/mineria/',code:'POW',description:'Red, dificultad, energía y economía minera.',tone:'auto'},
    {key:'hardware',label:'Hardware',path:'/hardware/',code:'ASIC',description:'Equipos, eficiencia, algoritmos y disponibilidad.',tone:'verified'},
    {key:'rentabilidades',label:'Rentabilidades',path:'/rentabilidades/',code:'RETURN',description:'Rendimiento observado por periodo, sin predicciones.',tone:'auto'},
    {key:'riesgos',label:'Riesgos',path:'/riesgos/',code:'RISK',description:'Custodia, mercado, tecnología y regulación.',tone:'verified'},
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
    bancos:{label:'Bancos',description:'Servicios blockchain declarados: custodia, pagos, depósitos tokenizados y acceso a activos digitales.',items:[
      {id:'bbva',name:'BBVA',subtitle:'Banca minorista · España',status:'verified',source:{name:'BBVA',url:'https://www.bbva.com/es/innovacion/bbva-ofrecera-servicios-de-compraventa-y-custodia-de-bitcoin-y-ether-en-espana/',type:'Comunicado corporativo'},fields:{'Servicio':'Compraventa y custodia de BTC y ETH','Canal':'Aplicación BBVA','Custodia':'Plataforma propia declarada','Marco':'Notificación MiCA ante CNMV'}},
      {id:'jpmorgan',name:'J.P. Morgan · Kinexys',subtitle:'Pagos y activos tokenizados',status:'verified',source:{name:'J.P. Morgan',url:'https://www.jpmorgan.com/kinexys/digital-assets',type:'Producto corporativo primario'},fields:{'Infraestructura':'Kinexys Digital Assets','Casos':'Tokenización, gestión y liquidación de activos','Dinero':'Blockchain Deposit Accounts','Acceso':'Institucional · sujeto a elegibilidad'}},
      {id:'sygnum',name:'Sygnum',subtitle:'Banco de activos digitales',status:'verified',source:{name:'Sygnum Bank',url:'https://www.sygnum.com/sygnum-bank/',type:'Fuente corporativa primaria'},fields:{'Licencia declarada':'Banco regulado por FINMA en Suiza','Servicios':'Trading, custodia, staking y tokenización','Cliente':'Profesional e institucional','Control':'Verificar alcance en registro del regulador'}}
    ]},
    exchanges:{label:'Exchanges',description:'Plataformas contrastadas con registros regulatorios, tarifas públicas y metodología de coste total.',items:[
      {id:'coinbase',name:'Coinbase',subtitle:'Exchange centralizado',status:'verified',source:{name:'Coinbase · licencias europeas',url:'https://www.coinbase.com/en-de/legal/licenses/europe',type:'Divulgación regulatoria del proveedor'},fields:{'Cobertura':'Europa · verificar entidad contratante','Autorización':'Comprobar servicios y pasaporte en ESMA','Precio':'Coinbase REST/WebSocket entra en Kaufman Reference Price','Riesgo':'Custodia y contraparte centralizada'}},
      {id:'kraken',name:'Kraken',subtitle:'Exchange centralizado',status:'auto',source:{name:'Kraken AssetPairs API',url:'https://docs.kraken.com/api/docs/rest-api/get-tradable-asset-pairs',type:'API y documentación oficial'},fields:{'Mercado de referencia':'BTC/USD · ETH/USD · SOL/USD','Comisiones':'Primer tramo maker/taker conectado diariamente','Precio':'Kraken entra en la mediana Kaufman','Riesgo':'Verificar entidad, licencia y servicios por país'}},
      {id:'bitstamp',name:'Bitstamp',subtitle:'Exchange centralizado',status:'verified',source:{name:'ESMA MiCA Register',url:'https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica',type:'Registro regulatorio europeo'},fields:{'Autorización UE':'Consultar entidad y servicios en registro MiCA','Precio':'No forma parte de Kaufman Reference Price v1','Comisiones':'Requiere tarifa aplicable al cliente y volumen','Riesgo':'Custodia y contraparte centralizada'}}
    ]},
    wallets:{label:'Wallets',description:'Autocustodia, custodia delegada y cuentas programables separadas por control de claves, exposición y recuperación.',items:[
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
    ]},
    riesgos:{label:'Riesgos',description:'Dependencias técnicas, operativas y jurídicas visibles; descentralización tratada como un conjunto de controles comprobables.',items:[
      {id:'contrato-inteligente',name:'Contrato inteligente',subtitle:'Vulnerabilidades y controles',status:'verified',source:{name:'OWASP Smart Contract Top 10',url:'https://scs.owasp.org/sctop10/',type:'Estándar de seguridad 2026'},fields:{'Indicadores':'Control de acceso, lógica, oráculos, reentrancia y dependencias','Uso':'Checklist de revisión, no auditoría','Evidencia':'Categorías OWASP 2026','Mitigación':'Diseño seguro, pruebas y auditoría independiente'}},
      {id:'infraestructura-l2',name:'Infraestructura L2',subtitle:'Upgrades, DA, secuenciador y salida',status:'auto',source:{name:'L2BEAT',url:'https://l2beat.com/scaling/summary',type:'Datos y matriz de riesgos'},fields:{'Indicadores':'Madurez, ventana de salida, validación y disponibilidad de datos','Uso':'Comparar dependencia adicional','Evidencia':'Campo original L2BEAT conservado','Límite':'El nivel de madurez no equivale a seguridad total'}},
      {id:'regulatorio',name:'Autorización y perímetro',subtitle:'Proveedor, servicio y jurisdicción',status:'verified',source:{name:'ESMA MiCA Register',url:'https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica',type:'Registro regulatorio europeo'},fields:{'Indicadores':'Entidad, autorización, servicio y pasaporte','Uso':'Comprobar proveedor concreto','Evidencia':'Registro ESMA y autoridad nacional','Límite':'Una marca puede operar mediante distintas entidades'}},
      {id:'custodia',name:'Custodia y recuperación',subtitle:'Claves, contraparte y dispositivo',status:'verified',source:{name:'ESMA · advertencia cripto',url:'https://www.esma.europa.eu/investor-corner/is-the-firm-regulated',type:'Orientación oficial'},fields:{'Indicadores':'Control de claves, autorización, recuperación y actualización','Uso':'Checklist previa a depositar activos','Evidencia':'Registro y documentación del proveedor','Mitigación':'Verificación de entidad, copias y seguridad del dispositivo'}},
      {id:'datos-web3',name:'Disponibilidad y procedencia de datos',subtitle:'RPC, indexación, oráculos y almacenamiento',status:'verified',source:{name:'IPFS Docs',url:'https://docs.ipfs.tech/concepts/what-is-ipfs/',type:'Documentación de protocolo'},fields:{'Indicadores':'Proveedor RPC, bloque, indexador, oráculo, CID y persistencia','Uso':'Detectar puntos únicos de fallo fuera de la cadena','Evidencia':'Configuración y contratos concretos','Mitigación':'Redundancia, verificación independiente y fallback probado'}},
      {id:'gobernanza-web3',name:'Gobernanza y llaves administrativas',subtitle:'Upgrades, pausas, módulos y umbrales',status:'verified',source:{name:'Safe Docs',url:'https://docs.safe.global/advanced/smart-account-concepts',type:'Documentación técnica primaria'},fields:{'Indicadores':'Propietarios, umbral, timelock, módulos, guards y poder de upgrade','Uso':'Separar marca descentralizada de control operativo real','Evidencia':'Contratos, configuración y procesos publicados','Mitigación':'Umbrales, demoras, límites y monitorización onchain'}}
    ]}
  };
  const HOME_DIRECTORY_KEYS = ['empresas','bancos','exchanges','wallets','proyectos','mineria','hardware','riesgos'];
  const ECOSYSTEM_ORDER = ['mercado','regulacion','empresas','infraestructura','custodia','riesgo'];
  const ECOSYSTEM_TERRITORIES = {
    mercado:{index:'01',label:'Mercado',x:21,y:22,side:'left',headline:'Capital, precio y liquidez en contexto.',description:'Une el precio de referencia, la tokenización, los mercados centralizados y el efecto fiscal de cada operación.',decision:'Determina si el tamaño, la liquidez y el coste hacen viable la operación ahora.',action:'Cuantificar mercado y coste',href:'/mercados/',linkLabel:'Abrir inteligencia de mercado',sublayers:[['Precios','/mercados/'],['RWA','/tokenizacion/'],['Exchanges','/exchanges/'],['Rentabilidad','/rentabilidades/'],['Fiscalidad','/fiscal/']]},
    regulacion:{index:'02',label:'Regulación',x:10,y:63,side:'left',headline:'La norma situada en su territorio.',description:'Relaciona fuentes primarias, fechas efectivas, autoridades y efectos prácticos sin confundir acceso técnico con vigencia jurídica.',decision:'Aclara qué autorización, fecha y autoridad pueden impedir o condicionar la operación.',action:'Comprobar perímetro regulatorio',href:'/regulacion/',linkLabel:'Abrir regulación blockchain',sublayers:[['Marcos vigentes','/regulacion/'],['Fiscalidad','/fiscal/'],['Bancos','/bancos/']]},
    empresas:{index:'03',label:'Empresas',x:54,y:13,side:'top',headline:'Actividad real detrás del anuncio.',description:'Conecta compañías, bancos e iniciativas tokenizadas con la fuente que permite comprobar su estado y alcance.',decision:'Separa una iniciativa operativa de un anuncio y revela qué entidad asume la ejecución.',action:'Verificar entidad y actividad',href:'/empresas/',linkLabel:'Abrir inteligencia empresarial',sublayers:[['Empresas','/empresas/'],['Bancos','/bancos/'],['RWA','/tokenizacion/'],['Proyectos','/proyectos/']]},
    infraestructura:{index:'04',label:'Infraestructura',x:86,y:35,side:'right',headline:'La capa que sostiene el sistema.',description:'Expone redes L2, proyectos, minería y hardware junto a sus dependencias, costes y señales operativas.',decision:'Hace visibles las dependencias técnicas que afectan continuidad, coste y capacidad de salida.',action:'Evaluar dependencias técnicas',href:'/mercados/',linkLabel:'Abrir inteligencia de infraestructura',sublayers:[['L2','/mercados/'],['Minería','/mineria/'],['Hardware','/hardware/'],['Proyectos','/proyectos/'],['Herramientas','/herramientas/']]},
    custodia:{index:'05',label:'Custodia',x:70,y:82,side:'right',headline:'Quién controla, conserva y recupera.',description:'Cruza wallets, exchanges y bancos para separar control de claves, contraparte, autorización y superficie de recuperación.',decision:'Define quién controla las claves, cómo se recupera el acceso y qué contraparte queda expuesta.',action:'Elegir modelo de custodia',href:'/wallets/',linkLabel:'Abrir inteligencia de custodia',sublayers:[['Wallets','/wallets/'],['Exchanges','/exchanges/'],['Bancos','/bancos/']]},
    riesgo:{index:'06',label:'Riesgo',x:30,y:89,side:'bottom',headline:'Dependencias visibles antes de decidir.',description:'Reúne riesgo tecnológico, regulatorio, de custodia y de infraestructura sin convertir señales parciales en una puntuación opaca.',decision:'Convierte dependencias dispersas en una lista de comprobaciones y condiciones de no ejecución.',action:'Construir condiciones de control',href:'/riesgos/',linkLabel:'Abrir mapa de riesgos',sublayers:[['Riesgos','/riesgos/'],['Regulación','/regulacion/'],['Custodia','/wallets/'],['Proyectos','/proyectos/']]}
  };

  const STATUS_LABELS = {verified:'VERIFICADO',sourcechecked:'FUENTE CONTRASTADA',unverified:'REVISIÓN NECESARIA',auto:'AUTOMÁTICO',offline:'NO DISPONIBLE'};
  const REGULATION_LEVEL_LABELS = {BINDING:'VINCULANTE',OFFICIAL_RULEBOOK:'REGLAMENTO OFICIAL',OFFICIAL_GUIDANCE:'GUÍA OFICIAL',PRIMARY_LAW:'LEY PRIMARIA'};
  const ANTENNA_STREAM = 'https://leafy-pudding-3f3427.netlify.app/api/market/stream';
  const MARKET_EDGE_ENDPOINT = 'https://leafy-pudding-3f3427.netlify.app/api/market/snapshot';
  const MARKET_CONTEXT_ENDPOINT = 'https://leafy-pudding-3f3427.netlify.app/api/market/context';
  const GAS_EDGE_ENDPOINT = 'https://leafy-pudding-3f3427.netlify.app/api/market/gas';
  const PRICE = new Intl.NumberFormat('es-ES',{style:'currency',currency:'USD',maximumFractionDigits:2});
  const SMALL_USD = new Intl.NumberFormat('es-ES',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:4});
  const APP_SCRIPT = document.querySelector('script[src*="kaufman-app.js"]');
  const APP_CACHE_VERSION = APP_SCRIPT ? new URL(APP_SCRIPT.src).searchParams.get('v') || 'dev' : 'dev';
  const REGULATION_SOURCE_CONTRACT = 'official-public-v2';
  const FILE_ROOT = location.protocol==='file:'&&APP_SCRIPT ? new URL('../',APP_SCRIPT.src) : null;
  const STATIC_HOST = /(^|\.)kaufmanadvisory\.io$|(^|\.)kaufmandvisory\.github\.io$/.test(location.hostname);
  let latestEthUsd = null;
  let latestMarketSnapshot = null;
  let antennaStream = null;
  let antennaConnected = false;
  let marketEdgeTimer = null;
  let marketEdgeRequest = null;
  let marketContextTimer = null;
  let marketContextRequest = null;
  let gasEdgeTimer = null;
  let gasEdgeRequest = null;
  let regulationFallbackPromise = null;
  let platformFallbackPromise = null;
  let fiscalGlobeRotation = -4;
  let fiscalGlobePaused = false;
  let fiscalGlobeFrame = null;
  let fiscalGlobeSelected = 'espana';
  let fiscalGlobeVisible = false;
  let ecosystemPinned = 'infraestructura';

  function statusBadge(status){return `<span class="kf-status ${status}">${STATUS_LABELS[status]||status}</span>`}
  function brandMarkMarkup(){return `<svg class="kf-brand-mark" viewBox="0 0 64 44" aria-hidden="true" focusable="false"><path d="M13 7v30M13 22h17M30 22 50 7M30 22l20 15"/><path class="kf-brand-mark-route" d="M13 7 30 22 50 37"/><rect x="25" y="17" width="10" height="10" rx="2" transform="rotate(45 30 22)"/><circle cx="13" cy="7" r="2.5"/><circle cx="13" cy="37" r="2.5"/><circle cx="50" cy="7" r="2.5"/><circle cx="50" cy="37" r="2.5"/></svg>`}
  function escapeHtml(value){return String(value).replace(/[&<>'"]/g,(ch)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
  function internalUrl(path){
    if(!FILE_ROOT||!path.startsWith('/'))return path;
    const parsed=new URL(path,'https://kaufman.local');
    const filePages={'/aviso-legal.html':'aviso','/privacidad.html':'privacidad','/terminos.html':'terminos','/checkout.html':'retirado','/intake.html':'retirado'};
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
  function profileUrl(type,id){return internalUrl(`/fichas/?tipo=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`)}
  function findRoute(key){return ROUTES.find((route)=>route.key===key)}

  function headerMarkup(page){
    const mainNav=[findRoute('mercados'),findRoute('regulacion'),findRoute('tokenizacion'),findRoute('herramientas'),findRoute('fiscal')];
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
        <nav class="kf-footer-nav" aria-label="Mapa del sitio">${ROUTES.map((route)=>`<a href="${route.path}">${route.label}</a>`).join('')}<a href="/fuentes/">Fuentes</a><a href="/fichas/">Fichas</a></nav>
      <div class="kf-footer-meta"><span class="kf-footer-meta-title">Legal y contacto</span><a href="/aviso-legal.html">Aviso legal</a><a href="/privacidad.html">Política de privacidad</a><a href="/terminos.html">Términos de uso</a><button type="button" data-consent-manage>Gestionar analítica</button><a href="/contacto/">Contacto</a></div>
      </div>
      <div class="kf-footer-bottom"><span>© 2026 Kaufman Advisory Group LLC</span><span>Los datos pueden contener latencia. Verifica la fuente antes de decidir.</span></div>
    </div></footer>`;
  }

  function searchOverlayMarkup(){return `<div class="kf-search-overlay" data-search-overlay aria-hidden="true"><div class="kf-search-dialog" role="dialog" aria-modal="true" aria-label="Buscar en Kaufman"><div class="kf-search-head"><input class="kf-global-input" type="search" placeholder="Buscar país, exchange, wallet, proyecto…" aria-label="Buscar"><button class="kf-search-close" type="button" aria-label="Cerrar búsqueda">×</button></div><div class="kf-search-results" aria-live="polite"></div></div></div>`}

  function pageHero(title,description,kicker='Kaufman',state='auto'){
    const stateCopy={auto:'integraciones automáticas activas',verified:'revisión con fuente primaria',unverified:'interpretación que necesita revisión',offline:'fuente temporalmente no disponible'}[state]||'estado documentado';
    const normalized=title.toLowerCase();
    const signature=normalized.includes('mercado')?'market':normalized.includes('regulación')?'regulation':normalized.includes('tokenización')?'tokenization':normalized.includes('herramienta')?'tools':normalized.includes('fiscal')?'fiscal':'directory';
    const signal={market:['Comparar','Medir','Contextualizar'],regulation:['Territorio','Vigencia','Autoridad'],tokenization:['Activo','Vehículo','Red'],tools:['Entrada','Ejecución','Resultado'],fiscal:['Escenario A','Contraste','Escenario B'],directory:['Índice','Evidencia','Ficha']}[signature];
    const actions={
      market:{question:'¿Qué señal cambia la lectura del capital hoy?',label:'Interrogar señales de mercado',href:'/mercados/#senales-de-mercado'},
      regulation:{question:'¿Qué norma, fecha o autoridad condiciona la operación?',label:'Abrir radar regulatorio',href:'/regulacion/'},
      tokenization:{question:'¿Qué producto, red y concentración sostienen el activo?',label:'Explorar capital tokenizado',href:'/tokenizacion/'},
      tools:{question:'¿Qué resultado cambia al introducir tus costes reales?',label:'Abrir herramientas operativas',href:'/herramientas/#rentabilidad-minera'},
      fiscal:{question:'¿Cuándo nace el hecho imponible y qué dato falta?',label:'Calcular un escenario',href:'/fiscal/'},
      directory:{question:'¿Qué entidad, infraestructura o riesgo necesitas comprobar?',label:'Buscar una ficha',href:'/fichas/'}
    };
    const noAction=['Aviso legal','Política de privacidad','Términos de uso','Contacto','Ruta retirada'].includes(title)||kicker==='Error 404';
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
    return `<section class="kf-engine-hero"><div class="kf-container"><div class="kf-engine-grid"><div class="kf-engine-copy"><p class="kf-eyebrow">Kaufman Decision Brief</p><h1>Antes de operar, sepa <span>qué puede cambiar la decisión.</span></h1><p>Describa una operación blockchain. Kaufman ordena jurisdicción, costes, infraestructura, custodia y riesgos en una ruta de comprobación con fuentes.</p><div class="kf-engine-actions"><a class="kf-button primary" href="#decision-brief">Definir mi operación <span>→</span></a><a class="kf-text-link" href="#explorar">Ver cómo se construye</a></div><dl><div><dt>Una operación</dt><dd>alcance concreto</dd></div><div><dt>Una ruta</dt><dd>controles priorizados</dd></div><div><dt>Una entrega</dt><dd>evidencia y límites</dd></div></dl></div><form class="kf-decision-builder" id="decision-brief" data-decision-builder><header><span>Configurar decisión</span><strong data-engine-state><i></i> Fuentes conectadas</strong></header><div class="kf-decision-fields"><label>Operación<select data-decision-operation>${operations.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label><label>Jurisdicción<select data-decision-jurisdiction>${jurisdictions.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label></div><div class="kf-decision-output" aria-live="polite"><span>RUTA PROPUESTA</span><h2 data-decision-title>Operar o invertir desde España</h2><p data-decision-summary>Comprueba tratamiento fiscal, proveedor, coste total, custodia y condiciones de salida antes de ejecutar.</p><ol data-decision-checks><li>Hecho fiscal y obligación de información</li><li>Autorización del proveedor</li><li>Coste total y custodia</li></ol><div class="kf-decision-live" data-market-asset="bitcoin"><span>Referencia BTC/USD</span><strong class="kf-market-price">—</strong><small data-market-age>Esperando precio fresco</small></div></div><div class="kf-decision-actions"><a class="kf-button secondary" data-decision-public href="/fiscal/">Abrir ruta pública</a><a class="kf-button primary" data-decision-contact href="/contacto/?asunto=decision-brief&operacion=operar&jurisdiccion=ES">Solicitar Decision Brief →</a></div><small>La ruta pública orienta. El Brief contratado delimita la operación, fuentes, supuestos y comprobaciones pendientes.</small></form></div><div class="kf-engine-market">${marketBandMarkup()}</div></div></section>`;
  }

  function marketBandMarkup(){
    const assets=[['bitcoin','BTC','Bitcoin'],['ethereum','ETH','Ethereum'],['solana','SOL','Solana']];
    return `<div class="kf-market-band"><div class="kf-container"><div class="kf-market-meta"><strong>Kaufman Reference Price</strong><span data-market-status aria-live="polite">Actualizando precios…</span></div><div class="kf-market-grid">${assets.map(([id,symbol,name])=>`<div class="kf-market-cell" data-market-asset="${id}"><img class="kf-coin-logo" src="${assetUrl(`/assets/logos/${id}.svg`)}" alt="Logo de ${name}"><div><div class="kf-market-name">${symbol}</div><div class="kf-market-pair">${name} / USD</div></div><div class="kf-market-value"><div class="kf-market-price">—</div><div class="kf-market-change na" data-market-age>Actualizando…</div><small class="kf-market-venues" data-market-venues>Mercados públicos server-side</small></div></div>`).join('')}</div></div></div>`;
  }

  function directoryHubMarkup(){
    const totalProfiles=HOME_DIRECTORY_KEYS.reduce((total,key)=>total+(CATALOGS[key]?.items.length||0),0);
    const priorityKeys=['proyectos','wallets','riesgos'];
    const priority=priorityKeys.map((key,index)=>{
      const catalog=CATALOGS[key],route=findRoute(key);
      const profiles=catalog.items.slice(0,3).map((item)=>`<a href="${profileUrl(key,item.id)}">${escapeHtml(item.name)} <span>↗</span></a>`).join('');
      return `<article class="kf-directory-territory kf-directory-territory-${index+1}" data-directory-card="${escapeHtml(key)}"><div class="kf-directory-coordinate"><span>0${index+1}</span><i></i><small>${escapeHtml(route.code)}</small></div><div><p>${catalog.items.length} fichas conectadas</p><h3><a href="${route.path}">${escapeHtml(catalog.label)}</a></h3><p class="kf-directory-summary">${escapeHtml(catalog.description)}</p><nav aria-label="Accesos rápidos de ${escapeHtml(catalog.label)}">${profiles}</nav><a class="kf-directory-route" href="${route.path}">Explorar territorio <span>→</span></a></div></article>`;
    }).join('');
    const indexRows=HOME_DIRECTORY_KEYS.filter((key)=>!priorityKeys.includes(key)).map((key,index)=>{
      const catalog=CATALOGS[key],route=findRoute(key);
      return `<a class="kf-directory-index-row" href="${route.path}"><span>${String(index+4).padStart(2,'0')}</span><strong>${escapeHtml(catalog.label)}</strong><small>${escapeHtml(catalog.description)}</small><b>${catalog.items.length} fichas</b><i>→</i></a>`;
    }).join('');
    return `<section class="kf-section kf-home-directories" id="directorios" data-home-directories><div class="kf-container"><header class="kf-directory-head"><div><p class="kf-kicker">Territorios de inteligencia</p><h2>Empieza por la decisión, no por el catálogo.</h2></div><div><strong>${HOME_DIRECTORY_KEYS.length}</strong><span>directorios · ${totalProfiles} fichas · una búsqueda común</span><p>Las rutas prioritarias se abren en profundidad. El resto permanece en un índice compacto y directo.</p></div></header><div class="kf-directory-priority">${priority}</div><div class="kf-directory-index"><div class="kf-directory-index-head"><span>Índice completo</span><a href="/fichas/">Ver todas las fichas →</a></div>${indexRows}</div></div></section>`;
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
    return [
      metric(l2?.kpis?.projects_without_emergency_exit_window??'—','proyectos sin ventana de salida urgente','L2BEAT · universo completo'),
      metric(l2?.coverage?.under_review??'—','proyectos L2 en revisión','Estado de la fuente'),
      metric(CATALOGS.riesgos?.items.length||'—','marcos de riesgo accionables','OWASP · L2BEAT · ESMA')
    ];
  }

  function ecosystemPanelMarkup(territoryId,snapshot=latestMarketSnapshot){
    const territory=ECOSYSTEM_TERRITORIES[territoryId]||ECOSYSTEM_TERRITORIES.infraestructura;
    const observedAt=snapshot?.generated_at||snapshot?.tokenization_markets?.received_at||snapshot?.l2_intelligence?.received_at;
    const observedLabel=observedAt&&!Number.isNaN(Date.parse(observedAt))?new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(new Date(observedAt)).replace('.','')+' UTC':'Esperando snapshot conectado';
    const metrics=ecosystemMetrics(territoryId,snapshot).map((item)=>`<div class="kf-eco-metric"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.source)}</small></div>`).join('');
    const sublayers=territory.sublayers.map(([label,href],index)=>`<a href="${href}"><span>${String(index+1).padStart(2,'0')}</span><strong>${escapeHtml(label)}</strong><i aria-hidden="true">→</i></a>`).join('');
    const briefHref=`/contacto/?asunto=decision-brief&territorio=${encodeURIComponent(territoryId)}`;
    return `<div class="kf-eco-panel-head"><p>${escapeHtml(territory.index)} / ${escapeHtml(territory.label)}</p><span>${escapeHtml(observedLabel)}</span></div><h3>${escapeHtml(territory.headline)}</h3><p class="kf-eco-panel-copy">${escapeHtml(territory.description)}</p><div class="kf-eco-decision"><span>IMPLICACIÓN PARA LA DECISIÓN</span><strong>${escapeHtml(territory.decision)}</strong></div><div class="kf-eco-metrics">${metrics}</div><div class="kf-eco-layers"><span>Capas relacionadas</span><nav aria-label="Capas de ${escapeHtml(territory.label)}">${sublayers}</nav></div><div class="kf-eco-panel-actions"><a class="kf-eco-open" href="${territory.href}">${escapeHtml(territory.linkLabel)} <span>→</span></a><a class="kf-eco-brief" href="${briefHref}">${escapeHtml(territory.action)}</a></div>`;
  }

  function ecosystemMapMarkup(){
    const nodes=ECOSYSTEM_ORDER.map((id)=>{const territory=ECOSYSTEM_TERRITORIES[id];const active=id==='infraestructura';return `<button class="kf-eco-node${active?' active':''}" id="ecosystem-tab-${id}" type="button" role="tab" aria-selected="${active}" aria-controls="kaufman-ecosystem-panel" data-eco-territory="${id}" data-side="${territory.side}" style="--eco-x:${territory.x}%;--eco-y:${territory.y}%"><span class="kf-eco-node-ring"><i></i></span><strong>${escapeHtml(territory.label)}</strong><small>${territory.index}</small></button>`}).join('');
    return `<section class="kf-section kf-ecosystem" id="explorar" data-ecosystem><div class="kf-container"><header class="kf-ecosystem-head"><div><p class="kf-kicker">Mapa Kaufman de Evidencia</p><h2>Qué puede cambiar una decisión.</h2></div><p>Cada territorio responde una pregunta operativa. Selecciona uno para ver su implicación, las métricas conectadas y la siguiente comprobación.</p></header><div class="kf-eco-shell"><div class="kf-eco-canvas" data-eco-current="infraestructura"><svg class="kf-eco-geometry" viewBox="0 0 960 600" aria-hidden="true"><path class="kf-eco-scaffold" d="M49 484 C77 211 272 44 548 62 C769 76 892 231 870 408 C850 541 711 581 576 520 C435 457 415 300 514 210 C592 139 713 167 747 253"/><path class="kf-eco-scaffold secondary" d="M94 518 C235 573 350 536 405 430 C457 331 425 208 335 150"/><path class="kf-eco-core-orbit" d="M331 318 C331 252 385 199 451 199 C517 199 570 252 570 318 C570 384 517 437 451 437 C385 437 331 384 331 318Z"/><path class="kf-eco-link" data-eco-link="mercado" d="M451 318 C369 273 285 197 197 131"/><path class="kf-eco-link" data-eco-link="regulacion" d="M451 318 C324 329 213 357 89 385"/><path class="kf-eco-link" data-eco-link="empresas" d="M451 318 C448 226 478 132 528 75"/><path class="kf-eco-link" data-eco-link="infraestructura" d="M451 318 C579 264 699 223 827 207"/><path class="kf-eco-link" data-eco-link="custodia" d="M451 318 C553 379 623 451 682 503"/><path class="kf-eco-link" data-eco-link="riesgo" d="M451 318 C397 416 342 485 283 539"/><path class="kf-eco-cross" d="M197 131 C334 88 456 84 528 75"/><path class="kf-eco-cross" d="M89 385 C243 393 338 421 283 539"/><path class="kf-eco-cross" d="M827 207 C776 332 745 425 682 503"/></svg><div class="kf-eco-center"><span>Decision Brief</span><strong>K</strong><i></i></div><div class="kf-eco-node-list" role="tablist" aria-label="Territorios del ecosistema Kaufman">${nodes}</div><div class="kf-eco-signals" aria-live="polite"><span data-eco-signal="updated">Conectando fuentes…</span><span data-eco-signal="market">Precios · esperando</span><span data-eco-signal="regulation">Regulación · esperando</span><span data-eco-signal="fiscal">Fiscal · esperando</span></div></div><aside class="kf-eco-panel" id="kaufman-ecosystem-panel" role="tabpanel" aria-labelledby="ecosystem-tab-infraestructura" aria-live="polite" data-eco-panel>${ecosystemPanelMarkup('infraestructura',null)}</aside></div><p class="kf-eco-instruction"><span aria-hidden="true">↳</span> Selecciona un territorio para cambiar la ruta de comprobación.</p></div></section>`;
  }

  function renderHome(){
    return `<main class="kf-main" id="main-content">
      ${homeHeroMarkup()}
      ${ecosystemMapMarkup()}
      <section class="kf-section kf-intelligence-briefing"><div class="kf-container"><header><div><p class="kf-kicker">Briefing conectado</p><h2>Lo que ha cambiado y qué decisión puede afectar.</h2></div><p>Una lectura principal regulatoria y una columna operativa de minería. La fuente conserva fecha, alcance y método.</p></header><div class="kf-briefing-grid"><section class="kf-briefing-lead"><div class="kf-briefing-label"><span>Regulación mundial</span><a href="/regulacion/">Abrir radar →</a></div><div data-home-regulation><div class="kf-live-empty">Cargando actualidad regulatoria…</div></div></section><aside class="kf-briefing-rail"><section><div class="kf-briefing-label"><span>Minería y hardware</span><span><a href="/mineria/">Minería →</a> <a href="/hardware/">Hardware →</a></span></div><div data-home-mining><div class="kf-live-empty">Cargando actualidad minera…</div></div></section><div class="kf-briefing-metrics" data-home-mining-metrics><div class="kf-live-empty">Cargando referencia minera…</div></div></aside></div></div></section>
      ${directoryHubMarkup()}
    </main>`;
  }

  function decisionCloseMarkup(page){
    const context={
      home:['De la evidencia a una decisión concreta.','Describe la operación. Kaufman devuelve alcance, controles prioritarios, fuentes y preguntas que aún necesitan confirmación.'],
      mercados:['Antes de mover capital, delimita la operación.','Conecta estructura de mercado, vehículo tokenizado, liquidez, costes y jurisdicción en una sola lectura.'],
      regulacion:['La norma importa cuando se aplica a una operación.','Sitúa actividad, territorio, proveedor y fecha para construir el perímetro que debe comprobarse.'],
      tokenizacion:['Una emisión necesita más que una red.','Ordena activo, vehículo, jurisdicción, infraestructura, custodia y riesgos antes de elegir arquitectura.'],
      herramientas:['Convierte el cálculo en una condición de decisión.','Kaufman documenta entradas, fuentes, sensibilidad del resultado y datos que siguen pendientes.'],
      fiscal:['Lleva el escenario al siguiente nivel de comprobación.','Transforma el cálculo en una lista de hechos, fuentes, supuestos y puntos para revisión profesional.']
    }[page]||['Convierte esta ficha en una decisión comprobable.','Incluye la entidad, el territorio y el objetivo; Kaufman conecta las evidencias relevantes y señala los huecos.'];
    return `<section class="kf-decision-close" aria-labelledby="decision-close-title"><div class="kf-container"><div><p class="kf-kicker">Kaufman Decision Brief</p><h2 id="decision-close-title">${context[0]}</h2><p>${context[1]}</p></div><ol><li><span>01</span>Operación y jurisdicción</li><li><span>02</span>Mercado, coste e infraestructura</li><li><span>03</span>Regulación, custodia y riesgo</li></ol><div class="kf-decision-close-action"><strong>Entrega definida antes de empezar</strong><span>Alcance, formato, plazo y presupuesto se confirman por escrito.</span><a class="kf-button primary" href="/contacto/?asunto=decision-brief&origen=${encodeURIComponent(page)}">Solicitar Decision Brief →</a></div></div></section>`;
  }

  function dataNoteMarkup(hasVerified=false){
    return `<div class="kf-data-note"><span>${statusBadge(hasVerified?'verified':'auto')}</span><div><strong>${hasVerified?'Registros respaldados por fuentes':'Registros monitorizados automáticamente'}</strong><p>Consulta cada ficha para abrir la evidencia, revisar su alcance y entender qué no permite concluir.</p></div><a href="/fuentes/">Fuentes →</a></div>`;
  }

  function marketSignalsMarkup(){
    return `<section class="kf-section kf-market-signals" id="senales-de-mercado" data-market-context><div class="kf-container"><div class="kf-section-head"><div><p class="kf-kicker">Señales de estructura</p><h2 class="kf-title small">Capital institucional, dominio y riesgo.</h2></div><p class="kf-intro">Flujos ETF estadounidenses, cuota de capitalización, interés abierto monitorizado y volatilidad implícita. Cada cifra conserva fuente y perímetro: no se mezclan definiciones incompatibles.</p></div><div class="kf-market-signal-layout"><article class="kf-etf-signal"><header><div><span>ETF spot de EE. UU.</span><h3>Flujo neto por sesión</h3></div><small data-etf-status>Conectando agregador público…</small></header><div class="kf-etf-latest"><div><span>Bitcoin · última sesión</span><strong data-etf-latest="bitcoin">—</strong><small data-etf-date="bitcoin">Fecha pendiente</small></div><div><span>Ethereum · última sesión</span><strong data-etf-latest="ethereum">—</strong><small data-etf-date="ethereum">Fecha pendiente</small></div></div><div class="kf-etf-legend"><span><i class="btc"></i>Bitcoin</span><span><i class="eth"></i>Ethereum</span><small>USD · barras sobre/bajo cero</small></div><div class="kf-etf-chart" data-etf-chart><div class="kf-live-empty">Esperando sesiones publicadas…</div></div><footer><span data-etf-period>Últimas sesiones disponibles</span><a href="https://coinflows.org/" target="_blank" rel="noopener noreferrer">CoinFlows ↗</a></footer></article><aside class="kf-market-structure"><article class="kf-dominance-signal"><header><span>Dominancia por capitalización</span><small data-dominance-time>CoinGecko Global</small></header><div class="kf-dominance-values"><div><i class="btc"></i><span>Bitcoin</span><strong data-dominance="btc">—</strong></div><div><i class="eth"></i><span>Ethereum</span><strong data-dominance="eth">—</strong></div><div><i class="other"></i><span>Resto</span><strong data-dominance="others">—</strong></div></div><div class="kf-dominance-bar"><i data-dominance-bar="btc"></i><i data-dominance-bar="eth"></i><i data-dominance-bar="others"></i></div></article><article class="kf-oi-signal"><header><span>Interés abierto monitorizado</span><a href="https://defillama.com/open-interest" target="_blank" rel="noopener noreferrer">DefiLlama ↗</a></header><strong data-open-interest>—</strong><div><span data-open-interest-change>Variación 7 d —</span><small data-open-interest-time>Perímetro de adaptadores de la fuente</small></div><ol data-open-interest-venues></ol></article><article class="kf-vol-signal"><header><span>Volatilidad implícita · DVOL</span><a href="https://docs.deribit.com/api-reference/market-data/public-get_volatility_index_data" target="_blank" rel="noopener noreferrer">Deribit ↗</a></header><div><span>Bitcoin<strong data-dvol="btc">—</strong></span><span>Ethereum<strong data-dvol="eth">—</strong></span></div><small data-dvol-time>Último cierre horario disponible</small></article></aside></div>${gasPanelMarkup()}</div></section>`;
  }

  function gasPanelMarkup(){
    const tiers=[['safe','Lento','Percentil 10'],['standard','Estándar','Percentil 50'],['fast','Rápido','Percentil 90']];
    return `<section class="kf-live-panel kf-fee-panel"><div class="kf-live-panel-head"><div><p class="kf-kicker">Comisiones EIP-1559 observadas</p><h2>Lo que cuesta Ethereum ahora.</h2></div><div class="kf-live-actions"><span data-gas-status aria-live="polite">Esperando bloque de Ethereum…</span></div></div><div class="kf-fee-context"><div><span>Base fee siguiente bloque</span><strong data-gas-base>—</strong><small>Gwei</small></div><div><span>Uso de gas mediano</span><strong data-gas-utilization>—</strong><small>20 bloques observados</small></div><div><span>Bloque</span><strong data-gas-block>—</strong><small data-gas-block-time>Timestamp pendiente</small></div></div><div class="kf-fee-tiers">${tiers.map(([key,label,note])=>`<article data-gas-tier="${key}"><span>${label}</span><strong data-gas-tier-gwei>—</strong><small>Gwei · ${note}</small><div><b data-gas-tier-cost>—</b><em>transferencia ETH · 21.000 gas</em></div></article>`).join('')}</div><div class="kf-fee-sources"><div><span>Fuente canónica</span><a href="https://ethereum.org/es/developers/docs/apis/json-rpc/#eth_feehistory" target="_blank" rel="noopener noreferrer">Ethereum eth_feeHistory ↗</a><small>Base fee + propinas observadas · consulta server-side cada minuto</small></div><div><span>Consulta pública</span><a href="https://etherscan.io/gastracker" target="_blank" rel="noopener noreferrer">Etherscan Gas Tracker ↗</a><small>Referencia visual externa; no interviene en el cálculo Kaufman</small></div></div></section>`;
  }

  function exchangeFeesMarkup(){
    return `<section class="kf-live-panel"><div class="kf-live-panel-head"><div><p class="kf-kicker">Comisiones conectadas</p><h2>Qué tarifa puede calcularse y cuál exige cuenta.</h2></div><div class="kf-live-actions"><span data-exchange-fee-status aria-live="polite">Cargando fuentes oficiales…</span></div></div><div class="kf-data-table-wrap"><table class="kf-data-table"><thead><tr><th>Exchange</th><th>Mercado y condición</th><th class="number">Maker</th><th class="number">Taker</th><th>Fuente</th></tr></thead><tbody data-exchange-fee-rows><tr><td colspan="5">Conectando tarifas oficiales…</td></tr></tbody></table></div><p class="kf-live-footnote">Actualización diaria. La tabla separa tarifa exacta pública de tarifa condicionada a cuenta, volumen, región o programa. No incluye spread, conversión, retirada ni deslizamiento.</p></section>`;
  }

  function regulationRadarMarkup(){
    return `<section class="kf-reg-dashboard" data-regulation-dashboard><div class="kf-reg-head"><div><h2>Regulación Blockchain</h2></div><span data-regulation-status>Conectando registro regulatorio…</span></div><div class="kf-reg-kpis"><article><span>Regímenes conectados</span><strong data-reg-kpi="regime_count">—</strong><small>Sin fichas de demostración</small></article><article><span>Jurisdicciones</span><strong data-reg-kpi="jurisdiction_count">—</strong><small>Perímetros separados</small></article><article><span>Fuentes accesibles</span><strong data-reg-reachable>—</strong><small>Comprobación server-side</small></article><article><span>Firma jurídica válida</span><strong data-reg-signed>—</strong><small>Ed25519 · huellas y cadena de revisión</small></article></div><div class="kf-reg-layout"><section><div class="kf-subsection-label">Cambios y fechas operativas</div><div class="kf-reg-events" data-regulation-events><div class="kf-live-empty">Cargando fechas verificadas…</div></div></section><aside><div class="kf-subsection-label">Monitor de fuentes primarias</div><div class="kf-reg-source-list" data-regulation-sources><div class="kf-live-empty">Comprobando fuentes…</div></div></aside></div><div class="kf-subsection-label kf-reg-regimes-label">Mapa de regímenes</div><div class="kf-reg-regimes" data-regulation-regimes><div class="kf-live-empty">Construyendo fichas regulatorias…</div></div><p class="kf-reg-method" data-regulation-methodology>La conexión técnica no sustituye la revisión jurídica.</p></section>`;
  }

  function recordCard(type,item,index){
    const source=item.source?item.source.type:'Fuente pendiente';
    return `<a class="kf-record" href="${profileUrl(type,item.id)}" data-record data-name="${escapeHtml(item.name.toLowerCase())}" data-status="${item.status}" data-reveal><div class="kf-record-top"><span class="kf-record-id">${String(index+1).padStart(2,'0')} / ${type}</span>${statusBadge(item.status)}</div><h2>${item.name}</h2><p>${item.subtitle}</p><div class="kf-record-foot"><span class="kf-record-source">${source}</span><span class="kf-record-link">Abrir ficha →</span></div></a>`;
  }

  function walletIntelligenceMarkup(){
    const rows=CATALOGS.wallets.items;
    const models=[
      ['Wallet caliente','Clave o acceso en un dispositivo conectado','Rapidez y uso frecuente','Malware, phishing y firma ciega','MetaMask'],
      ['Signer hardware','Clave aislada; la transacción se prepara fuera','Aislar la clave del ordenador','Pantalla, firmware, backup y contrato firmado','Ledger · Trezor'],
      ['Cuenta inteligente','Control definido por contrato, propietarios y umbral','Tesorería compartida y políticas','Módulos, guards, owners y poder de upgrade','Safe'],
      ['Custodia delegada','La entidad controla o administra la clave','Recuperación y operativa gestionadas','Contraparte, autorización, segregación y retiradas','Bancos · exchanges']
    ];
    return `<section class="kf-wallet-intel"><div class="kf-intel-lead"><div><p class="kf-kicker">Arquitectura de custodia</p><h2>Fría y caliente no bastan para decidir.</h2></div><p>La clasificación útil separa quién controla la clave, dónde se firma, cómo se recupera y qué dependencias pueden detener una retirada. Un signer hardware puede usarse como almacén frío o como cuenta activa de Web3: el riesgo cambia con el uso.</p></div><div class="kf-custody-spectrum">${models.map(([name,key,use,risk,examples],index)=>`<article><span>0${index+1}</span><div><h3>${name}</h3><p>${key}</p></div><dl><div><dt>Encaja en</dt><dd>${use}</dd></div><div><dt>Comprobar</dt><dd>${risk}</dd></div><div><dt>Ejemplos</dt><dd>${examples}</dd></div></dl></article>`).join('')}</div><div class="kf-wallet-compare"><div class="kf-subsection-label">Comparación operativa</div><div class="kf-table-scroll"><table><thead><tr><th>Solución</th><th>Arquitectura</th><th>Exposición</th><th>Control</th><th>Firma</th><th>Recuperación</th><th>Señal observada</th></tr></thead><tbody>${rows.map((item)=>`<tr><td><a href="${profileUrl('wallets',item.id)}"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.subtitle)}</span></a></td><td>${escapeHtml(item.wallet.class)}</td><td>${escapeHtml(item.wallet.temperature)}</td><td>${escapeHtml(item.wallet.control)}</td><td>${escapeHtml(item.wallet.signing)}</td><td>${escapeHtml(item.wallet.recovery)}</td><td data-wallet-release="${item.id}">Consultando fuente oficial…</td></tr>`).join('')}</tbody></table></div></div><div class="kf-intel-evidence"><p><strong>Regla Kaufman:</strong> «hardware» describe dónde se protege y usa la clave; «fría» describe una política operativa sin interacción Web3 habitual.</p><nav><a href="https://trezor.io/learn/basics/what-is-a-hardware-wallet" target="_blank" rel="noopener noreferrer">Trezor: hot vs cold ↗</a><a href="https://support.metamask.io/start/metamask-is-a-self-custodial-wallet" target="_blank" rel="noopener noreferrer">MetaMask: autocustodia ↗</a><a href="https://docs.safe.global/advanced/smart-account-concepts" target="_blank" rel="noopener noreferrer">Safe: propietarios y umbral ↗</a></nav></div></section>`;
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
    return `<section class="kf-web3-map"><div class="kf-intel-lead"><div><p class="kf-kicker">Infraestructura Web3</p><h2>Una aplicación descentralizada sigue teniendo dependencias.</h2></div><p>Kaufman no clasifica un proyecto por su token. Lo sitúa en la función que resuelve y muestra qué debe verificarse: contratos, operadores, proveedores de datos, almacenamiento, governance y ruta de salida.</p></div><div class="kf-web3-flow">${layers.map((layer,index)=>`<article><span>${layer.code}</span><div><small>${index===0?'ORIGEN':index===layers.length-1?'INTERFAZ':'CAPA'}</small><h3>${layer.name}</h3><p>${layer.copy}</p><strong>${layer.items.join(' · ')}</strong></div></article>`).join('')}</div><div class="kf-decentralization-rule"><div><span>DESCENTRALIZACIÓN</span><strong>No es una etiqueta binaria.</strong></div><ol><li><b>Control</b><span>Quién puede actualizar, pausar o censurar.</span></li><li><b>Verificación</b><span>Qué puede comprobar el usuario sin confiar en la interfaz.</span></li><li><b>Disponibilidad</b><span>Qué ocurre si falla un operador, RPC, indexador o proveedor.</span></li><li><b>Salida</b><span>Si existe una ruta para recuperar control o fondos.</span></li></ol><a href="/riesgos/">Abrir controles de descentralización →</a></div><div class="kf-intel-evidence"><p><strong>Criterio de inclusión:</strong> una pieza ocupa una función diferenciada del stack y dispone de documentación técnica primaria o de una matriz pública conectada. No es un ranking ni una recomendación.</p><nav><a href="https://ethereum.org/developers/docs/" target="_blank" rel="noopener noreferrer">Stack Ethereum ↗</a><a href="https://docs.ipfs.tech/concepts/what-is-ipfs/" target="_blank" rel="noopener noreferrer">Qué es —y qué no es— IPFS ↗</a><a href="https://thegraph.com/docs/en/about/" target="_blank" rel="noopener noreferrer">Indexación onchain ↗</a></nav></div></section>`;
  }

  function decentralizationRiskMarkup(){
    const dimensions=[
      ['Upgrade y pausa','Direcciones con poder, umbral, timelock y alcance','Contratos desplegados · gobernanza'],
      ['Producción de bloques','Secuenciador, proponente o validador; alternativa ante caída','L2BEAT · cliente o red'],
      ['Disponibilidad de datos','Dónde se publican datos y si pueden reconstruirse','L2BEAT · protocolo DA'],
      ['Oráculos y bridges','Fuente, agregación, actualización, límites y permisos','Contratos y documentación'],
      ['Interfaz y lectura','RPC, indexador, gateway, bloque y posibilidad de verificación','The Graph · IPFS · nodo'],
      ['Custodia y salida','Quién firma, cómo se recupera y si existe retirada independiente','Wallet · contrato · entidad']
    ];
    return `<section class="kf-risk-intel"><div class="kf-intel-lead"><div><p class="kf-kicker">Riesgo de descentralización</p><h2>Medir el control real, no el relato.</h2></div><p>Un sistema puede estar descentralizado en consenso y centralizado en upgrades, datos, secuenciación o interfaz. La revisión se hace por dimensión y siempre sobre el despliegue concreto.</p></div><div class="kf-risk-dimensions"><header><span>Dimensión</span><span>Pregunta comprobable</span><span>Evidencia mínima</span></header>${dimensions.map(([name,question,evidence],index)=>`<article><span>0${index+1}</span><h3>${name}</h3><p>${question}</p><strong>${evidence}</strong></article>`).join('')}</div><div class="kf-risk-route"><div><span>PROTOCOLO</span><strong>Contrato y governance</strong></div><i></i><div><span>OPERACIÓN</span><strong>Nodos, datos y interfaces</strong></div><i></i><div><span>USUARIO</span><strong>Firma, recuperación y salida</strong></div></div><p class="kf-risk-note">La ausencia de una prueba no demuestra centralización; demuestra que esa afirmación todavía no está sustentada. Kaufman no rellena ese vacío con una puntuación inventada.</p></section>`;
  }

  function renderDirectory(type){
    const catalog=CATALOGS[type];
    if(!catalog)return renderNotFound();
    const hasVerified=catalog.items.some((item)=>item.status==='verified');
    const connected=type==='exchanges'?exchangeFeesMarkup():type==='regulacion'?regulationRadarMarkup():'';
    const special=type==='wallets'?walletIntelligenceMarkup():type==='proyectos'?web3ArchitectureMarkup():type==='riesgos'?decentralizationRiskMarkup():'';
    const availableStates=[...new Set(catalog.items.map((item)=>item.status))];
    const statusOptions=`<option value="all">Todos los estados</option>${availableStates.map((state)=>`<option value="${state}">${STATUS_LABELS[state]||state}</option>`).join('')}`;
    const heroTone=hasVerified?'verified':'auto';
    return `<main class="kf-main" id="main-content">${pageHero(catalog.label,catalog.description,'Directorio con fuentes',heroTone)}<section class="kf-section"><div class="kf-container">${special}${connected}${dataNoteMarkup(hasVerified)}<div class="kf-toolbar"><div class="kf-search-field"><input type="search" data-directory-search placeholder="Buscar en ${catalog.label.toLowerCase()}…" aria-label="Buscar en ${catalog.label}"></div><select class="kf-select" data-status-filter aria-label="Filtrar por estado">${statusOptions}</select><span class="kf-result-count" data-result-count>${catalog.items.length} fichas</span></div><div class="kf-record-grid" data-record-grid>${catalog.items.map((item,index)=>recordCard(type,item,index)).join('')}<div class="kf-empty" data-empty hidden>No hay fichas que coincidan con el filtro.</div></div></div></section></main>`;
  }

  function l2IntelligenceMarkup(){
    const kpis=[['total_l2_tvs_usd','Valor asegurado en L2'],['stage_1_or_2_projects','Proyectos con madurez 1 o 2'],['projects_without_emergency_exit_window','Sin salida ante upgrade urgente'],['curated_public_rwa_usd','RWA público en el radar']];
    return `<section class="kf-l2-intelligence"><div class="kf-l2-lead"><div><p class="kf-kicker">Infraestructura L2 · explicada en español</p><h2 class="kf-title small">Lo importante está debajo del ticker.</h2></div><div><p>Madurez, stack, disponibilidad de datos, ventana de salida y quién puede mantener el sistema vivo si falla un operador. Kaufman conserva el dato original de L2BEAT y traduce su significado.</p><span data-l2-status>Conectando L2BEAT…</span><nav class="kf-l2-context-nav"><a href="/proyectos/">Ver el stack Web3 →</a><a href="/riesgos/">Abrir controles de descentralización →</a></nav></div></div><div class="kf-l2-kpis">${kpis.map(([key,label])=>`<article><span>${label}</span><strong data-l2-kpi="${key}">—</strong></article>`).join('')}</div><div class="kf-l2-glossary"><div><strong>Madurez ≠ seguridad</strong><span>El nivel mide madurez y descentralización según el marco L2BEAT.</span></div><div><strong>TVS ≠ volumen</strong><span>Total Value Secured es valor asegurado por el sistema.</span></div><div><strong>DA</strong><span>Dónde se publican los datos necesarios para reconstruir y verificar el estado.</span></div></div><div class="kf-l2-projects" data-l2-projects><div class="kf-live-empty">Esperando proyectos y riesgos…</div></div><div class="kf-rwa-method kf-l2-method"><div><span>COBERTURA</span><strong data-l2-coverage>—</strong></div><div><span>SELECCIÓN</span><strong>Muestra editorial declarada · no es un ranking</strong></div><div><span>FUENTE</span><a href="https://l2beat.com/scaling/summary" target="_blank" rel="noopener noreferrer">L2BEAT ↗</a></div><p data-l2-methodology>El nivel de madurez no sustituye una auditoría de seguridad. Ante discrepancia prevalece la ficha original.</p></div></section>`;
  }

  function renderMarkets(){
    const rows=[['bitcoin','BTC','Bitcoin'],['ethereum','ETH','Ethereum'],['solana','SOL','Solana']];
    const rwaKpis=[
      ['tracked_rwa_tvl_usd','Capital RWA onchain','Protocolos de activos reales, sin stablecoins'],
      ['treasury_bills_tvl_usd','Deuda soberana tokenizada','Exposición etiquetada como Treasury Bills'],
      ['rwa_lending_tvl_usd','Financiación RWA','TVL en protocolos de préstamo RWA'],
      ['usd_stablecoin_value_usd','Rail monetario tokenizado','Stablecoins USD valoradas sin asumir paridad']
    ];
    return `<main class="kf-main" id="main-content">${pageHero('Mercados','La infraestructura financiera que ya se está moviendo onchain: deuda pública, fondos, crédito, materias primas, acciones y redes de liquidación. El precio cripto es contexto, no el producto.','Capital tokenizado mundial','auto')}<section class="kf-section kf-rwa-market"><div class="kf-container"><div class="kf-rwa-lead"><div><p class="kf-kicker">Mercado que no aparece en un ticker</p><h2 class="kf-title">El nuevo mapa del capital.</h2></div><div><p>Medimos capital rastreado en productos RWA, su concentración y por qué redes circula. Las cifras llegan server-side desde adaptadores públicos; ninguna fila se completa a mano.</p><span class="kf-rwa-observed" data-tokenization-status>Conectando fuente pública…</span></div></div><div class="kf-rwa-kpis">${rwaKpis.map(([key,label,note],index)=>`<article class="kf-rwa-kpi"><span>0${index+1} · ${label}</span><strong data-token-kpi="${key}">—</strong><small>${note}</small></article>`).join('')}</div><div class="kf-rwa-ratios"><article><span>RWA / stablecoins USD</span><strong data-token-ratio="tracked_rwa_to_stablecoin_pct">—</strong><small>Escala del capital RWA frente al rail de liquidación</small></article><article><span>Concentración top 5</span><strong data-token-ratio="top_5_concentration_pct">—</strong><small>Cuánto controlan los cinco mayores productos</small></article><article><span>Capital multichain</span><strong data-token-ratio="multichain_tvl_share_pct">—</strong><small>TVL de productos desplegados en más de una red</small></article><article><span>Variación stablecoins 24 h</span><strong data-token-ratio="stablecoin_supply_change_24h_pct">—</strong><small>Cambio de circulación valorada, no del precio del token</small></article></div><div class="kf-rwa-layout"><section class="kf-rwa-panel"><div class="kf-rwa-panel-head"><div><p class="kf-kicker">Clases de activo</p><h3>Dónde entra el capital.</h3></div><small>No sumar: una iniciativa puede tener varias etiquetas</small></div><div class="kf-rwa-bars" data-token-segments><div class="kf-live-empty">Esperando clases de activo…</div></div></section><section class="kf-rwa-panel"><div class="kf-rwa-panel-head"><div><p class="kf-kicker">Infraestructura</p><h3>Por qué redes circula.</h3></div><small>Distribución de chainTvls del universo RWA</small></div><div class="kf-rwa-bars" data-token-networks><div class="kf-live-empty">Esperando redes…</div></div></section></div><div class="kf-section-head kf-rwa-subhead"><div><p class="kf-kicker">Concentración del mercado</p><h2 class="kf-title small">Los productos que ya pesan.</h2></div><p class="kf-intro">No ordenamos monedas: ordenamos vehículos y protocolos por capital onchain rastreado, con clase de activo, redes y adaptador auditable.</p></div><div class="kf-data-table-wrap"><table class="kf-data-table kf-rwa-leaders"><thead><tr><th>Producto / protocolo</th><th>Clase</th><th class="number">Capital onchain</th><th>Redes</th><th class="number">7 días</th><th>Evidencia</th></tr></thead><tbody data-token-leaders><tr><td colspan="6">Esperando universo RWA…</td></tr></tbody></table></div><div class="kf-rwa-settlement"><div><p class="kf-kicker">Rail de liquidación</p><h3>Dónde vive el dólar tokenizado.</h3><p>Distribución del valor circulante de stablecoins USD por red. Se multiplica oferta por precio observado: nunca se presupone automáticamente 1 USD.</p></div><div class="kf-rwa-bars compact" data-token-stablecoin-networks><div class="kf-live-empty">Esperando distribución…</div></div></div><div class="kf-rwa-method"><div><span>UNIVERSO</span><strong data-token-coverage>—</strong></div><div><span>MÉTODO</span><strong>TVL RWA elegible · etiquetas solapables · chainTvls por red</strong></div><div><span>FUENTE</span><a href="https://defillama.com/docs/api" target="_blank" rel="noopener noreferrer">DefiLlama Open API ↗</a></div><p data-token-methodology>Los endpoints no publican timestamp por fila. Kaufman registra la recepción y bloquea el panel si supera 24 horas.</p></div>${l2IntelligenceMarkup()}</div></section>${marketSignalsMarkup()}${marketBandMarkup()}<section class="kf-section"><div class="kf-container"><div class="kf-section-head"><div><p class="kf-kicker">Contexto de mercado</p><h2 class="kf-title small">Precio, fuentes y método.</h2></div><p class="kf-intro">La antena de BTC, ETH y SOL queda como capa auxiliar. Si no existe una observación fresca, Kaufman muestra “No disponible”.</p></div><div class="kf-antenna-contract"><div><span>Publicación</span><strong>Solo observaciones &lt; 5 s</strong></div><div><span>Agregación</span><strong>Mediana de mercados elegibles</strong></div><div><span>Stablecoins</span><strong>USDT y USDC convertidos, sin paridad asumida</strong></div><div><span>Entrega</span><strong>Backend Kaufman · navegador sin APIs externas</strong></div></div><div class="kf-data-table-wrap"><table class="kf-data-table kf-reference-table"><thead><tr><th>Activo</th><th class="number">Precio USD</th><th>Actualización</th><th>Fuentes utilizadas</th><th>Confianza</th><th class="number">Divergencia máx.</th></tr></thead><tbody>${rows.map(([id,symbol,name])=>`<tr data-market-asset="${id}"><td><strong>${symbol}</strong> · ${name}</td><td class="number kf-market-price">—</td><td class="kf-market-change na" data-market-age>No disponible</td><td data-market-venues>Sin fuentes frescas</td><td data-market-confidence>—</td><td class="number" data-market-divergence>—</td></tr>`).join('')}</tbody></table></div><div class="kf-method-strip"><strong>Kaufman Reference Price v1</strong><span data-market-methodology>Mediana · frescura &lt; 5 s · volumen mínimo · umbral de divergencia 2,5 % · conexión sana.</span></div><div class="kf-section-head kf-spaced-head"><div><p class="kf-kicker">Conversión estable</p><h2 class="kf-title small">USD, USDT y USDC no son sinónimos.</h2></div><p class="kf-intro">Las parejas de Binance y DEX solo entran cuando existe un tipo USDT/USD o USDC/USD fresco observado en otro mercado.</p></div><div class="kf-stable-grid" data-stablecoin-grid><div class="kf-live-empty">Esperando tipos de conversión…</div></div><div class="kf-section-head kf-spaced-head"><div><p class="kf-kicker">Fuentes de mercado</p><h2 class="kf-title small">Mercados utilizados en el precio.</h2></div><p class="kf-intro">Solo intervienen mercados frescos, con volumen suficiente y dentro del umbral de divergencia.</p></div><div class="kf-provider-grid" data-provider-grid><div class="kf-live-empty">Actualizando fuentes server-side…</div></div><div class="kf-section-head kf-spaced-head"><div><p class="kf-kicker">Mercados descentralizados</p><h2 class="kf-title small">Tokens identificados por red y contrato.</h2></div><p class="kf-intro">DEX Screener aporta pools públicos. Como su respuesta no incluye timestamp de la cotización, v1 los muestra y almacena, pero no los incorpora silenciosamente al precio de referencia.</p></div><div class="kf-data-table-wrap"><table class="kf-data-table kf-dex-table"><thead><tr><th>Token onchain</th><th>Pool</th><th class="number">Precio</th><th class="number">Volumen 24 h</th><th class="number">Liquidez</th><th>Estado</th></tr></thead><tbody data-dex-pools><tr><td colspan="6">Esperando DEX Screener…</td></tr></tbody></table></div><div class="kf-section-head kf-spaced-head"><div><p class="kf-kicker">Metadatos</p><h2 class="kf-title small">CoinGecko, fuera del ticker.</h2></div><p class="kf-intro">Solo IDs, imágenes, categorías, capitalización y oferta circulante. Cada registro exige un last_updated_at válido.</p></div><div class="kf-metadata-grid" data-market-metadata><div class="kf-live-empty">Metadatos en segundo plano…</div></div></div></section></main>`;
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
        <div class="kf-token-lead"><div><p class="kf-kicker">Tokenización mundial · datos conectados</p><h2 class="kf-title">El capital detrás del anuncio.</h2></div><div><p>No contamos menciones corporativas ni anuncios de prensa como adopción. Medimos capital onchain rastreado, composición, concentración, infraestructura y calidad de la evidencia.</p><span data-tokenization-status>Conectando fuentes públicas…</span></div></div>
        <div class="kf-rwa-kpis kf-token-kpis">${kpis.map(([key,label,note],index)=>`<article class="kf-rwa-kpi"><span>0${index+1} · ${label}</span><strong data-token-kpi="${key}">—</strong><small>${note}</small></article>`).join('')}</div>
        <div class="kf-token-signal-strip"><article><span>Concentración top 5</span><strong data-token-ratio="top_5_concentration_pct">—</strong><small>Cuota del capital rastreado</small></article><article><span>Capital multichain</span><strong data-token-ratio="multichain_tvl_share_pct">—</strong><small>Productos desplegados en más de una red</small></article><article><span>Cobertura por red</span><strong data-token-ratio="network_allocation_coverage_pct">—</strong><small>TVL reconciliado con desglose chainTvls</small></article><article><span>Stablecoins / RWA</span><strong data-token-multiple>—</strong><small>Escala del rail USD frente al capital RWA</small></article></div>

        <section class="kf-token-analyst"><div class="kf-token-analyst-copy"><p class="kf-kicker">Kaufman Grounded Analysis</p><h2>Pregunta al dato, no a una alucinación.</h2><p>El motor cruza el snapshot conectado y responde únicamente con magnitudes presentes en él. No usa un proveedor de IA de pago ni envía la consulta fuera de Kaufman.</p><div class="kf-token-question-list">${questions.map(([value,label])=>`<button type="button" data-token-question="${value}">${label}</button>`).join('')}</div></div><div class="kf-token-analyst-console"><form data-token-analyst-form><label for="token-question">Pregunta sobre el mercado tokenizado</label><div><input id="token-question" data-token-analyst-input placeholder="Ej. ¿qué producto crece más esta semana?"><button type="submit">Analizar →</button></div></form><div class="kf-token-answer" data-token-answer><span>ANÁLISIS CON EVIDENCIA</span><strong>Selecciona una pregunta para interrogar el snapshot.</strong><p>Cada respuesta mostrará cálculo y límite del dato.</p></div><small data-token-engine-policy>Motor determinista y trazable · IA generativa externa no conectada</small></div></section>

        <div class="kf-rwa-layout kf-token-breakdowns"><section class="kf-rwa-panel"><div class="kf-rwa-panel-head"><div><p class="kf-kicker">Clases de activo</p><h3>Qué se está tokenizando.</h3></div><small>Etiquetas solapables; no deben sumarse</small></div><div class="kf-rwa-bars" data-token-segments><div class="kf-live-empty">Esperando clases de activo…</div></div></section><section class="kf-rwa-panel"><div class="kf-rwa-panel-head"><div><p class="kf-kicker">Infraestructura</p><h3>Dónde se está liquidando.</h3></div><small>Asignación normalizada al TVL de cada producto</small></div><div class="kf-rwa-bars" data-token-networks><div class="kf-live-empty">Esperando redes…</div></div></section></div>

        <div class="kf-section-head kf-token-section-head"><div><p class="kf-kicker">Movimiento semanal</p><h2 class="kf-title small">Escala antes que ruido.</h2></div><p class="kf-intro">Solo entran productos con al menos 10 M USD rastreados. La variación procede del agregador y no representa rentabilidad para el inversor.</p></div><div class="kf-token-movers"><section><header><span>Expansión</span><strong>Mayores subidas 7 d</strong></header><div data-token-gainers><div class="kf-live-empty">Esperando movimiento…</div></div></section><section><header><span>Contracción</span><strong>Mayores bajadas 7 d</strong></header><div data-token-decliners><div class="kf-live-empty">Esperando movimiento…</div></div></section></div>

        <div class="kf-section-head kf-token-section-head"><div><p class="kf-kicker">Explorador de productos</p><h2 class="kf-title small">El universo, fila por fila.</h2></div><p class="kf-intro">Cada identidad usa el slug del proveedor, enlaza el proyecto cuando existe y conserva el adaptador público que calcula su TVL.</p></div><div class="kf-token-product-controls"><div class="kf-search-field"><input type="search" data-token-product-search placeholder="Buscar producto…" aria-label="Buscar producto tokenizado"></div><select class="kf-select" data-token-segment-filter aria-label="Filtrar clase"><option value="all">Todas las clases</option></select><select class="kf-select" data-token-network-filter aria-label="Filtrar red"><option value="all">Todas las redes</option></select><select class="kf-select" data-token-product-sort aria-label="Ordenar productos"><option value="value-desc">Mayor capital</option><option value="change-desc">Mayor subida 7 d</option><option value="change-asc">Mayor bajada 7 d</option><option value="name">Nombre A–Z</option></select><span data-token-product-count>Esperando productos…</span></div><div class="kf-data-table-wrap"><table class="kf-data-table kf-token-products-table"><thead><tr><th>Producto</th><th>Clase</th><th class="number">Capital</th><th class="number">Cuota</th><th class="number">7 días</th><th>Redes</th><th>Evidencia</th></tr></thead><tbody data-token-products><tr><td colspan="7">Esperando universo conectado…</td></tr></tbody></table></div>

        <div class="kf-section-head kf-token-section-head"><div><p class="kf-kicker">Infraestructura de liquidación</p><h2 class="kf-title small">RWA público dentro de L2.</h2></div><p class="kf-intro">L2BEAT aporta contexto de etapa y confianza adicional. Sus cifras no se suman al universo DefiLlama porque tienen definición y cobertura distintas.</p></div><div class="kf-data-table-wrap"><table class="kf-data-table"><thead><tr><th>Red L2</th><th>Etapa</th><th class="number">RWA público</th><th class="number">% del TVS</th><th class="number">Confianza adicional</th><th>Datos</th><th>Fuente</th></tr></thead><tbody data-token-l2-rows><tr><td colspan="7">Esperando contexto L2BEAT…</td></tr></tbody></table></div>

        <div class="kf-section-head kf-token-section-head"><div><p class="kf-kicker">Realidad del dato</p><h2 class="kf-title small">Qué sabemos y qué no.</h2></div><p class="kf-intro">La cobertura se mide y los huecos se publican. Un enlace ausente o un timestamp no proporcionado no se transforma en verificación.</p></div><div class="kf-token-quality-grid"><article><span>Registros publicados</span><strong data-token-quality="publication_rate_pct">—</strong><small data-token-quality-detail="published">—</small></article><article><span>Enlace de proyecto</span><strong data-token-quality="project_link_coverage_pct">—</strong><small>Cobertura de evidencia institucional</small></article><article><span>Adaptador auditable</span><strong data-token-quality="adapter_link_coverage_pct">—</strong><small>Código de cálculo accesible</small></article><article><span>Asignación por red</span><strong data-token-quality="network_allocation_coverage_pct">—</strong><small>Parte del TVL que reconcilia por red</small></article><article><span>Desgloses corregidos</span><strong data-token-quality="raw_chain_breakdown_mismatch_records">—</strong><small>Desviación bruta &gt; 2 %, normalizada</small></article><article><span>Timestamp por producto</span><strong>No publicado</strong><small>Se usa hora de recepción; bloqueo a las 24 h</small></article></div>

        <section class="kf-token-source-reality"><div><p class="kf-kicker">Stack gratuito de hoy</p><h2>Valor sin comprar una caja negra.</h2><p>DefiLlama cubre productos, TVL, etiquetas y redes; L2BEAT añade riesgos de infraestructura. RWA.xyz podría enriquecer tokens, titulares y transferencias, pero requiere clave y acceso, por eso no se presenta como conectado.</p><p class="kf-token-license-note"><strong>Realidad comercial:</strong> una fuente pública no implica licencia comercial ilimitada. Antes de monetizar o republicar a escala deben revisarse atribución y <a href="https://defillama.com/terms" target="_blank" rel="noopener noreferrer">términos del proveedor ↗</a>.</p></div><div class="kf-token-source-stack"><article><i data-token-source-health="defillama_tokenization"></i><div><strong>DefiLlama Open API</strong><span>Capital, clases, redes, stablecoins y adaptadores</span></div><a href="https://defillama.com/docs/api" target="_blank" rel="noopener noreferrer">Fuente ↗</a></article><article><i data-token-source-health="l2beat_projects"></i><div><strong>L2BEAT Public API</strong><span>RWA público, etapa y confianza de infraestructura L2</span></div><a href="https://l2beat.com/scaling/tvs" target="_blank" rel="noopener noreferrer">Fuente ↗</a></article><article class="blocked"><i></i><div><strong>RWA.xyz API</strong><span>No conectada · requiere clave y acceso a API Tools</span></div><a href="https://docs.rwa.xyz/api/getting-started" target="_blank" rel="noopener noreferrer">Requisito ↗</a></article></div></section>

        <div class="kf-rwa-settlement kf-token-settlement"><div><p class="kf-kicker">Rail de liquidación</p><h3>Dónde vive el dólar tokenizado.</h3><p>Distribución de stablecoins USD por red. La oferta se multiplica por precio observado; nunca se presupone automáticamente 1 USD.</p></div><div class="kf-rwa-bars compact" data-token-stablecoin-networks><div class="kf-live-empty">Esperando distribución…</div></div></div>
        <div class="kf-rwa-method kf-token-method"><div><span>UNIVERSO</span><strong data-token-coverage>—</strong></div><div><span>GRANO</span><strong>Producto por slug · red normalizada · recepción horaria</strong></div><div><span>ESTADO</span><strong>Observado en agregador · no verificación del emisor</strong></div><p data-token-methodology>Los endpoints no publican timestamp por fila. Kaufman registra la recepción y bloquea todo el dashboard si supera 24 horas.</p></div>
      </div></section></main>`;
  }

  function renderFiscal(){
    return `<main class="kf-main" id="main-content">${pageHero('Fiscal','Fiscalidad blockchain comparada por hecho económico, residencia y tipo de actividad. Kaufman muestra la regla, la fuente y el punto exacto donde deja de poder concluir.','Inteligencia fiscal comparada','auto')}
      <section class="kf-section kf-fiscal-live" data-fiscal-dashboard><div class="kf-container">
        <div class="kf-fiscal-lead"><div><p class="kf-kicker">Fiscalidad blockchain · jurisdicción × evento</p><h2 class="kf-title">El impuesto empieza antes de la cifra.</h2></div><div><p>Vender, permutar, hacer staking, minar o simplemente mantener activos no activan la misma regla. El comparador separa hecho imponible, categoría, momento, reporte y límite de la evidencia.</p><span data-fiscal-status>Conectando registro fiscal server-side…</span></div></div>
        <div class="kf-fiscal-kpis"><article><span>Jurisdicciones</span><strong data-fiscal-kpi="jurisdiction_count">—</strong><small>Mismo contrato comparativo</small></article><article><span>Hechos fiscales</span><strong data-fiscal-kpi="fact_count">—</strong><small>Cinco eventos por jurisdicción</small></article><article><span>Hechos resueltos</span><strong data-fiscal-kpi="resolved_fact_pct">—</strong><small>El resto se bloquea, no se rellena</small></article><article><span>Fuentes oficiales</span><strong data-fiscal-kpi="source_count">—</strong><small>Leyes, doctrina, guías y formularios</small></article><article><span>Última revisión jurídica</span><strong data-fiscal-reviewed>—</strong><small>Accesibilidad ≠ vigencia material</small></article></div>

        <section class="kf-fiscal-engine"><div class="kf-fiscal-engine-copy"><p class="kf-kicker">Motor de hechos fiscales</p><h2>Describe la operación. Kaufman calcula el impacto incremental.</h2><p>Aplica tramos y umbrales oficiales al escenario introducido. Separa ganancia, estimación, método, supuestos y límites para que la cifra sea auditable.</p><div class="kf-fiscal-safety"><span>NO SUSTITUYE</span><strong>Residencia efectiva · cuota final · convenios · impuestos regionales · estructura societaria</strong></div></div><form class="kf-fiscal-controls" data-fiscal-scenario-form><div class="kf-field"><label for="fiscal-jurisdiction">Jurisdicción fiscal</label><select class="kf-select" id="fiscal-jurisdiction" data-fiscal-jurisdiction><option value="">Esperando datos…</option></select></div><div class="kf-field"><label for="fiscal-event">Evento</label><select class="kf-select" id="fiscal-event" data-fiscal-event><option value="sell_fiat">Venta a moneda fiat</option><option value="crypto_swap" selected>Permuta cripto a cripto</option><option value="staking">Staking y recompensas</option><option value="mining">Minería y validación</option><option value="holding">Tenencia y declaración</option></select></div><div class="kf-field"><label for="fiscal-profile">Perfil</label><select class="kf-select" id="fiscal-profile" data-fiscal-profile><option value="individual-investor">Persona física · inversión</option><option value="individual-business">Persona física · actividad</option><option value="company">Sociedad</option></select></div><div class="kf-field"><label for="fiscal-holding">Días de tenencia</label><input id="fiscal-holding" type="number" min="0" step="1" value="400" data-fiscal-holding></div><div class="kf-field"><label for="fiscal-proceeds">Valor de salida</label><input id="fiscal-proceeds" type="number" min="0" step="0.01" placeholder="Necesario para calcular" data-fiscal-proceeds></div><div class="kf-field"><label for="fiscal-cost">Coste fiscal ajustado</label><input id="fiscal-cost" type="number" min="0" step="0.01" placeholder="Necesario para calcular" data-fiscal-cost></div><div class="kf-field"><label for="fiscal-prior-base">Base fiscal previa del año</label><input id="fiscal-prior-base" type="number" min="0" step="0.01" value="0" data-fiscal-prior-base></div><div class="kf-field"><label for="fiscal-filing">Estado de declaración</label><select class="kf-select" id="fiscal-filing" data-fiscal-filing-status><option value="single">Individual</option><option value="joint">Conjunta / matrimonio</option><option value="head">Cabeza de familia</option><option value="separate">Matrimonio separado</option></select></div><div class="kf-field"><label for="fiscal-context">Tratamiento del activo</label><select class="kf-select" id="fiscal-context" data-fiscal-tax-context><option value="standard">Regla general</option></select></div><div class="kf-field"><label for="fiscal-turnover">Volumen anual de actividad</label><input id="fiscal-turnover" type="number" min="0" step="0.01" value="0" data-fiscal-turnover></div><div class="kf-field"><label for="fiscal-custody">Custodia</label><select class="kf-select" id="fiscal-custody" data-fiscal-custody><option value="self">Self-custody</option><option value="domestic">Proveedor nacional</option><option value="foreign">Proveedor extranjero</option></select></div><button class="kf-button primary" type="submit">Calcular escenario →</button></form><div class="kf-fiscal-result" data-fiscal-scenario-result><div class="kf-live-empty">Esperando el registro fiscal conectado…</div></div></section>

        <div class="kf-section-head kf-fiscal-section-head"><div><p class="kf-kicker">Cruce de jurisdicciones</p><h2 class="kf-title small">La diferencia que cambia la decisión.</h2></div><p class="kf-intro">El mismo evento puede realizar una ganancia hoy, diferirla o quedar fuera de un impuesto concreto. Compara significado, no solo tipos.</p></div><div class="kf-fiscal-compare-controls"><div class="kf-field"><label for="fiscal-left">Jurisdicción A</label><select class="kf-select" id="fiscal-left" data-fiscal-left><option>Esperando…</option></select></div><div class="kf-field"><label for="fiscal-right">Jurisdicción B</label><select class="kf-select" id="fiscal-right" data-fiscal-right><option>Esperando…</option></select></div><div class="kf-field"><label for="fiscal-compare-event">Evento comparable</label><select class="kf-select" id="fiscal-compare-event" data-fiscal-compare-event><option value="crypto_swap">Permuta cripto a cripto</option><option value="sell_fiat">Venta a moneda fiat</option><option value="staking">Staking y recompensas</option><option value="mining">Minería y validación</option><option value="holding">Tenencia y declaración</option></select></div></div><div data-fiscal-comparison><div class="kf-live-empty">Conectando matriz comparativa…</div></div>

        <div class="kf-section-head kf-fiscal-section-head"><div><p class="kf-kicker">Cambios que sí importan</p><h2 class="kf-title small">Radar fiscal 2026.</h2></div><p class="kf-intro">Solo se publican cambios con fuente oficial y efecto operativo identificable. Una actualización de página no se interpreta automáticamente como cambio legal.</p></div><div class="kf-fiscal-change-list" data-fiscal-changes><div class="kf-live-empty">Esperando señales verificadas…</div></div>

        <div class="kf-section-head kf-fiscal-section-head"><div><p class="kf-kicker">Realidad del dato</p><h2 class="kf-title small">La cobertura también se audita.</h2></div><p class="kf-intro">La monitorización diaria comprueba si una fuente responde. La vigencia jurídica solo cambia tras revisar el contenido.</p></div><div class="kf-fiscal-quality"><div class="kf-fiscal-quality-grid"><article><span>Hechos con fuente</span><strong data-fiscal-quality="facts_with_source_pct">—</strong><small>Conclusiones enlazadas</small></article><article><span>Cobertura jurisdiccional</span><strong data-fiscal-quality="primary_jurisdiction_coverage_pct">—</strong><small>Al menos una fuente oficial</small></article><article><span>Fuentes comprobadas</span><strong data-fiscal-quality="checked_source_count">—</strong><small>Disponibilidad técnica diaria</small></article><article><span>Fuentes accesibles</span><strong data-fiscal-quality="reachable_source_pct">—</strong><small>No certifica vigencia legal</small></article></div><div class="kf-fiscal-source-register" data-fiscal-source-register><div class="kf-live-empty">Esperando registro de fuentes…</div></div></div>

        <section class="kf-fiscal-globe-section" id="fiscal-globe"><div class="kf-fiscal-globe-head"><div><p class="kf-kicker">Mapa fiscal interactivo</p><h2 class="kf-title small">Gira el mundo. Cambia el hecho.</h2></div><div><p>Arrastra el globo o selecciona un punto. Cada marcador abre la ficha vigente de esa jurisdicción y sincroniza el motor de escenarios.</p><button type="button" data-fiscal-globe-pause aria-pressed="false">Pausar rotación</button></div></div><div class="kf-fiscal-globe-layout"><div class="kf-fiscal-space"><div class="kf-fiscal-orbit one"></div><div class="kf-fiscal-orbit two"></div><div class="kf-fiscal-earth" data-fiscal-earth role="application" aria-label="Globo fiscal interactivo; arrastra para rotar"><div class="kf-fiscal-earth-texture"></div><div class="kf-fiscal-earth-shade"></div><div class="kf-fiscal-earth-grid"></div><div class="kf-fiscal-markers" data-fiscal-markers></div></div><div class="kf-fiscal-earth-shadow"></div><small>Imagen terrestre: NASA/GSFC Scientific Visualization Studio · Blue Marble</small></div><aside class="kf-fiscal-globe-sheet" data-fiscal-globe-sheet><div class="kf-live-empty">Esperando jurisdicciones…</div></aside></div></section>

        <div class="kf-rwa-method kf-fiscal-method"><div><span>GRANO</span><strong>Jurisdicción × evento fiscal × perfil</strong></div><div><span>CADENCIA</span><strong>Fuentes comprobadas cada 24 h · revisión jurídica al cambio</strong></div><div><span>SALIDA PROHIBIDA</span><strong>Cuota final, residencia recomendada o exención garantizada</strong></div><p data-fiscal-methodology>Fiscalidad informativa. Si faltan residencia, actividad o calificación del activo, Kaufman bloquea la conclusión.</p></div>
      </div></section></main>`;
  }

  function renderTools(){
    return `<main class="kf-main" id="main-content">${pageHero('Herramientas','Cálculo y cruce de datos para entender minería y fiscalidad sin completar huecos con supuestos ocultos.','Laboratorio Kaufman','auto')}<section class="kf-section"><div class="kf-container"><div class="kf-tool-index"><a href="#rentabilidad-minera"><span>01</span><strong>Rentabilidad minera</strong><small>Precio, red, energía y hardware</small></a><a href="#cruce-fiscal"><span>02</span><strong>Cruce fiscal</strong><small>Hechos entre jurisdicciones</small></a></div>
      <article class="kf-tool-workbench" id="rentabilidad-minera"><div class="kf-tool-heading"><div><p class="kf-kicker">Herramienta conectada</p><h2>Rentabilidad minera de hoy</h2><p>El motor usa la referencia diaria de red Bitcoin, precio BTC y especificación oficial del equipo. Introduce tus costes para obtener un resultado propio.</p></div>${statusBadge('auto')}</div><div class="kf-tool-grid"><form class="kf-calculator-controls" data-mining-calculator><div class="kf-field"><label for="tool-hardware">Hardware</label><select class="kf-select" id="tool-hardware" data-calc-hardware><option value="s21-xp">Antminer S21 XP · BITMAIN</option></select></div><input type="hidden" value="manual" data-calc-country><div class="kf-field"><label for="tool-electricity">Electricidad · USD/kWh</label><input id="tool-electricity" data-calc-electricity inputmode="decimal" type="number" min="0" step="0.001" placeholder="Ej. 0,08"><small>Tu contrato local; Kaufman no inventa una tarifa nacional.</small></div><div class="kf-field"><label for="tool-uptime">Uptime · %</label><input id="tool-uptime" data-calc-uptime inputmode="decimal" type="number" min="0" max="100" step="0.1" value="100"></div><div class="kf-field"><label for="tool-pool">Comisión de pool · %</label><input id="tool-pool" data-calc-pool inputmode="decimal" type="number" min="0" max="100" step="0.1" value="0"></div><div class="kf-field"><label for="tool-cooling">Refrigeración extra · %</label><input id="tool-cooling" data-calc-cooling inputmode="decimal" type="number" min="0" step="0.1" value="0"></div><div class="kf-field"><label for="tool-hardware-cost">Coste de hardware · USD</label><input id="tool-hardware-cost" data-calc-hardware-cost inputmode="decimal" type="number" min="0" step="1" placeholder="Opcional"></div><div class="kf-calc-source" data-calc-status>Cargando datos de red…</div></form><div class="kf-calculator-output"><div class="kf-calc-kpi"><span>Ingreso bruto / día</span><strong data-calc-gross>—</strong></div><div class="kf-calc-kpi"><span>Consumo / día</span><strong data-calc-energy>—</strong></div><div class="kf-calc-kpi"><span>Electricidad / día</span><strong data-calc-power-cost>Introduce tu tarifa</strong></div><div class="kf-calc-kpi primary"><span>Resultado / día</span><strong data-calc-profit>—</strong></div><div class="kf-calc-kpi"><span>Recuperación del hardware</span><strong data-calc-payback>Introduce coste</strong></div><p>Resultado antes de impuestos, averías, reparaciones, financiación, aranceles y variaciones de dificultad. No es una promesa de rentabilidad.</p></div></div></article>
      <article class="kf-tool-workbench" id="cruce-fiscal" data-fiscal-dashboard><div class="kf-tool-heading"><div><p class="kf-kicker">Herramienta conectada</p><h2>Cruce fiscal por hecho económico</h2><p>La matriz pública compara venta, permuta, staking, minería y tenencia con fuente, nivel de certeza y límites por jurisdicción.</p></div>${statusBadge('auto')}</div><div class="kf-fiscal-kpis"><article><span>Jurisdicciones</span><strong data-fiscal-kpi="jurisdiction_count">—</strong><small>Mismo contrato comparativo</small></article><article><span>Hechos fiscales</span><strong data-fiscal-kpi="fact_count">—</strong><small>Cinco eventos por jurisdicción</small></article><article><span>Hechos resueltos</span><strong data-fiscal-kpi="resolved_fact_pct">—</strong><small>El resto se bloquea</small></article><article><span>Última revisión</span><strong data-fiscal-reviewed>—</strong><small>Fuentes primarias</small></article></div><div class="kf-section-action"><span data-fiscal-status>Cargando registro fiscal…</span><a class="kf-button primary" href="/fiscal/">Abrir comparador fiscal →</a></div></article>
    </div></section></main>`;
  }

  function renderReturns(){
    return `<main class="kf-main" id="main-content">${pageHero('Rentabilidades','Rendimientos observados en mercados públicos para 7, 30 y 365 días. Son contexto histórico, no predicciones.','Datos históricos','auto')}${marketBandMarkup()}<section class="kf-section"><div class="kf-container"><div class="kf-section-head"><div><p class="kf-kicker">Horizontes conectados</p><h2 class="kf-title small">El periodo cambia la lectura.</h2></div><p class="kf-intro">Los cierres diarios proceden de Kraken OHLC. La referencia actual conserva la mediana de mercados elegibles y se identifica por separado.</p></div><div class="kf-data-table-wrap"><table class="kf-data-table"><thead><tr><th>Activo</th><th class="number">7 días</th><th class="number">30 días</th><th class="number">1 año</th><th>Observación</th></tr></thead><tbody>${[['bitcoin','BTC'],['ethereum','ETH'],['solana','SOL']].map(([id,symbol])=>`<tr data-return-asset="${id}"><td><strong>${symbol}</strong></td><td class="number" data-return-period="7d">—</td><td class="number" data-return-period="30d">—</td><td class="number" data-return-period="365d">—</td><td data-return-status>Cargando histórico…</td></tr>`).join('')}</tbody></table></div><div class="kf-data-note"><span>${statusBadge('auto')}</span><div><strong>Serie diaria auditable</strong><p>Cambio porcentual entre cierres diarios. No incluye comisiones, impuestos, slippage ni rendimiento de staking.</p></div><a href="https://docs.kraken.com/api/docs/rest-api/get-ohlc-data" target="_blank" rel="noopener noreferrer">Kraken OHLC ↗</a></div></div></section></main>`;
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

  function renderProfile(){
    const params=new URLSearchParams(location.search);
    const type=params.get('tipo')||'fiscal';
    const id=params.get('id')||CATALOGS[type]?.items?.[0]?.id;
    const catalog=CATALOGS[type];
    const item=catalog?.items.find((entry)=>entry.id===id);
    if(!catalog||!item)return renderNotFound('Ficha no encontrada');
    const facts=Object.entries(item.fields||{}).map(([key,value])=>`<div class="kf-fact"><dt>${key}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
    const source=item.source?`<div class="kf-source-item"><strong>${item.source.name}</strong><span>${item.source.type}</span><a href="${item.source.url}" target="_blank" rel="noopener noreferrer">Abrir fuente ↗</a></div>`:`<div class="kf-source-item"><strong>Fuente</strong><span>No publicada; ficha bloqueada</span></div>`;
    return `<main class="kf-main" id="main-content">${pageHero(item.name,item.subtitle,`Ficha / ${catalog.label}`,item.status)}<section class="kf-section"><div class="kf-container"><div class="kf-profile"><article class="kf-profile-main"><div class="kf-profile-title"><div><h2>${item.name}</h2><p>${item.subtitle}</p></div>${statusBadge(item.status)}</div><dl class="kf-fact-list">${facts}</dl></article><aside class="kf-source-panel"><h3>Prueba del dato</h3>${source}<div class="kf-source-item"><strong>Fuentes</strong><a href="/fuentes/">Ver fuente y alcance →</a></div></aside></div><div style="margin-top:24px"><a class="kf-button secondary" href="/${type}/">← Volver a ${catalog.label}</a></div></div></section></main>`;
  }

  function renderSources(){
    const sources=[
      {name:'Coinbase Exchange REST',scope:'Ticker público BTC, ETH y SOL para la mediana Kaufman',cadence:'Consulta edge cada 3 segundos · server-side',status:'auto',url:'https://docs.cdp.coinbase.com/exchange/reference/exchangerestapi_getproductticker'},
      {name:'Kraken REST Ticker',scope:'Ticker público BTC, ETH y SOL para la mediana Kaufman',cadence:'Consulta edge cada 3 segundos · server-side',status:'auto',url:'https://docs.kraken.com/api/docs/rest-api/get-ticker-information'},
      {name:'Binance Spot REST',scope:'Ticker público BTC, ETH y SOL como mercado adicional',cadence:'Consulta edge cada 3 segundos · server-side',status:'auto',url:'https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints'},
      {name:'DEX Screener API',scope:'Pools por chainId + contractAddress',cadence:'Snapshot público diario',status:'auto',url:'https://docs.dexscreener.com/api/reference'},
      {name:'DefiLlama Open API',scope:'TVL RWA, clases de activo, redes, stablecoins y adaptadores auditables',cadence:'Snapshot público diario',status:'auto',url:'https://defillama.com/docs/api'},
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
    return `<main class="kf-main" id="main-content">${pageHero('Fuentes','Registro visible de proveedores, cobertura, cadencia y estado de cada integración.','Trazabilidad')}<section class="kf-section"><div class="kf-container"><div class="kf-source-register">${sources.map((source)=>`<div class="kf-source-row"><strong>${source.name}</strong><span>${source.scope}</span><span>${source.cadence}</span><div>${statusBadge(source.status)}${source.url?` <a href="${source.url}" target="_blank" rel="noopener noreferrer">Abrir ↗</a>`:''}</div></div>`).join('')}</div></div></section></main>`;
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
        ['4. Analítica y consentimiento','<p>Google Tag Manager, Google Analytics 4 y GoatCounter no se cargan desde esta interfaz antes de aceptar. GA4 puede recopilar estadísticas de sesión, ubicación aproximada, navegador, dispositivo y un identificador de cliente. Rechazar no impide utilizar Kaufman. La elección se conserva en <code>kaufman_analytics_consent</code> y puede restablecerse mediante “Gestionar analítica” en el footer.</p>'],
        ['5. Destinatarios y encargados','<ul><li>Proveedor de hosting, CDN y seguridad que entregue el sitio.</li><li>Proveedor de correo que procese mensajes enviados a Kaufman.</li><li>Google, para Tag Manager y Analytics 4, únicamente con consentimiento.</li><li>GoatCounter, para medición estadística, únicamente con consentimiento.</li><li>Autoridades o asesores cuando exista una obligación o necesidad jurídica válida.</li></ul><p>Kaufman no vende información personal ni la comparte para publicidad comportamental propia.</p>'],
        ['6. Transferencias internacionales','<p>La entidad responsable está en Estados Unidos y algunos proveedores pueden procesar datos fuera del país del visitante. Cuando resulte exigible, el tratamiento deberá apoyarse en el mecanismo de transferencia aplicable y en las condiciones del proveedor. La activación voluntaria de analítica no elimina las obligaciones del responsable.</p>'],
        ['7. Conservación','<dl><div><dt>Preferencia de analítica</dt><dd>Hasta cambiarla o borrar el almacenamiento del navegador.</dd></div><div><dt>Registros técnicos</dt><dd>Durante el periodo necesario para seguridad, diagnóstico y obligaciones del proveedor.</dd></div><div><dt>Analítica</dt><dd>Según la configuración de retención vigente en cada proveedor.</dd></div><div><dt>Correos</dt><dd>Mientras sea necesario para responder y, después, durante los plazos exigibles para obligaciones o reclamaciones.</dd></div></dl><p>Kaufman no fija públicamente un plazo numérico cuando la configuración de producción todavía no está confirmada.</p>'],
        ['8. Derechos','<p>Cuando la normativa aplicable lo reconozca, puedes solicitar acceso, rectificación, supresión, oposición, limitación, portabilidad y no ser objeto de decisiones automatizadas. También puedes retirar el consentimiento sin afectar al tratamiento previo.</p><p>Envía la solicitud a <a href="mailto:contact@kaufmanadvisory.io?subject=Ejercicio%20de%20derechos">contact@kaufmanadvisory.io</a>. Kaufman podrá pedir información proporcionada y necesaria para verificar identidad. Si el RGPD resulta aplicable, puedes reclamar ante la autoridad de control competente; en España, la AEPD.</p>'],
        ['9. Seguridad y minimización','<p>Kaufman limita la recogida a lo necesario para las finalidades descritas y aplica medidas técnicas y organizativas proporcionadas. Ningún sistema es absolutamente seguro; una incidencia material se gestionará conforme a las obligaciones aplicables.</p>'],
        ['10. Menores','<p>La plataforma se dirige a una audiencia general y no está diseñada para recopilar deliberadamente datos de menores. Si un representante considera que un menor ha enviado información personal, puede solicitar su revisión y eliminación.</p>'],
        ['11. Decisiones automatizadas','<p>La versión actual no utiliza datos personales para conceder crédito, fijar precios individualizados, crear perfiles fiscales o adoptar decisiones con efectos jurídicos. Las respuestas automáticas de datos de mercado no se basan en la identidad del visitante.</p>'],
        ['12. Fuentes jurídicas y cambios','<p>La estructura informativa sigue los principios del RGPD, las orientaciones de la AEPD y, para la entidad estadounidense, los principios de transparencia de la FTC. Esta política se actualizará antes de incorporar cuentas, alertas personales, pagos o nuevos tratamientos.</p><ul><li><a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj" target="_blank" rel="noopener noreferrer">Reglamento General de Protección de Datos ↗</a></li><li><a href="https://www.aepd.es/derechos-y-deberes/ejerce-tus-derechos" target="_blank" rel="noopener noreferrer">Derechos de protección de datos · AEPD ↗</a></li><li><a href="https://www.ftc.gov/business-guidance/privacy-security/consumer-privacy" target="_blank" rel="noopener noreferrer">Consumer Privacy · FTC ↗</a></li></ul><p>Versión publicada el 13 de julio de 2026.</p>']
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
    return `<main class="kf-main" id="main-content">${pageHero(legal.title,legal.description,'Legal / actualizado 13 julio 2026','verified')}<section class="kf-section"><div class="kf-container"><article class="kf-legal"><header class="kf-legal-header"><span>Versión 1.0 · 13 julio 2026</span><p>${legal.summary||legal.description}</p></header>${legal.sections.map(([title,copy])=>`<section><h2>${title}</h2><div class="kf-legal-copy">${copy}</div></section>`).join('')}<p class="kf-legal-note">Documento operativo basado en el tratamiento actual. Debe revisarse jurídicamente antes de activar cuentas, pagos, perfilado, publicidad comportamental o nuevos proveedores.</p></article></div></section></main>`;
  }

  function renderAllProfiles(){
    const entries=Object.entries(CATALOGS).flatMap(([type,catalog])=>catalog.items.map((item)=>({type,...item})));
    const states=[...new Set(entries.map((item)=>item.status))];
    return `<main class="kf-main" id="main-content">${pageHero('Fichas','Índice transversal de entidades, jurisdicciones, herramientas y conceptos de Kaufman.','Directorio global')}<section class="kf-section"><div class="kf-container"><div class="kf-toolbar"><div class="kf-search-field"><input type="search" data-directory-search placeholder="Buscar en todas las fichas…" aria-label="Buscar fichas"></div><select class="kf-select" data-status-filter><option value="all">Todos los estados</option>${states.map((state)=>`<option value="${state}">${STATUS_LABELS[state]}</option>`).join('')}</select><span class="kf-result-count" data-result-count>${entries.length} fichas</span></div><div class="kf-record-grid" data-record-grid>${entries.map((item,index)=>recordCard(item.type,item,index)).join('')}<div class="kf-empty" data-empty hidden>No hay fichas que coincidan con el filtro.</div></div></div></section></main>`;
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
    if(page==='herramientas')return renderTools();
    if(page==='rentabilidades')return renderReturns();
    if(page==='ficha')return renderProfile();
    if(page==='fichas'){
      const params=new URLSearchParams(location.search);
      return params.has('tipo')||params.has('id')?renderProfile():renderAllProfiles();
    }
    if(page==='fuentes')return renderSources();
    if(page==='contacto')return renderContact();
    if(page==='aviso'||page==='privacidad'||page==='terminos')return renderLegal(page);
    if(page==='retirado')return renderRetired();
    if(CATALOGS[page])return renderDirectory(page);
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

  function initTokenizationFilters(){
    const dashboard=document.querySelector('[data-tokenization-dashboard]');
    if(!dashboard)return;
    const redraw=()=>renderTokenizationIntelligence(latestMarketSnapshot);
    dashboard.querySelectorAll('[data-token-product-search],[data-token-segment-filter],[data-token-network-filter],[data-token-product-sort]').forEach((control)=>control.addEventListener(control.matches('input')?'input':'change',redraw));
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
    dashboard.querySelector('[data-fiscal-markers]')?.addEventListener('click',(event)=>{
      const button=event.target.closest('[data-fiscal-marker]');if(!button)return;
      fiscalGlobeSelected=button.dataset.fiscalMarker;
      const select=dashboard.querySelector('[data-fiscal-jurisdiction]');if(select)select.value=fiscalGlobeSelected;
      renderFiscalScenario(latestMarketSnapshot?.fiscal_intelligence);
      renderFiscalGlobe(latestMarketSnapshot?.fiscal_intelligence,true);
    });
    dashboard.querySelector('[data-fiscal-globe-sheet]')?.addEventListener('click',(event)=>{
      const button=event.target.closest('[data-fiscal-globe-jump]');if(!button)return;
      fiscalGlobeSelected=button.dataset.fiscalGlobeJump;
      const select=dashboard.querySelector('[data-fiscal-jurisdiction]');if(select)select.value=fiscalGlobeSelected;
      renderFiscalScenario(latestMarketSnapshot?.fiscal_intelligence);
      renderFiscalGlobe(latestMarketSnapshot?.fiscal_intelligence,true);
    });
    const pause=dashboard.querySelector('[data-fiscal-globe-pause]');
    pause?.addEventListener('click',()=>{fiscalGlobePaused=!fiscalGlobePaused;pause.setAttribute('aria-pressed',String(fiscalGlobePaused));pause.textContent=fiscalGlobePaused?'Reanudar rotación':'Pausar rotación'});
    const earth=dashboard.querySelector('[data-fiscal-earth]');
    if(earth){
      if('IntersectionObserver' in window){
        const observer=new IntersectionObserver((entries)=>{fiscalGlobeVisible=entries.some((entry)=>entry.isIntersecting)},{threshold:.05});
        observer.observe(earth);
      }else fiscalGlobeVisible=true;
      let dragging=false,startX=0,startRotation=0;
      earth.addEventListener('pointerdown',(event)=>{dragging=true;startX=event.clientX;startRotation=fiscalGlobeRotation;earth.setPointerCapture?.(event.pointerId);earth.classList.add('dragging')});
      earth.addEventListener('pointermove',(event)=>{if(!dragging)return;fiscalGlobeRotation=startRotation-(event.clientX-startX)*.45;positionFiscalGlobe(latestMarketSnapshot?.fiscal_intelligence)});
      const stop=(event)=>{dragging=false;earth.releasePointerCapture?.(event.pointerId);earth.classList.remove('dragging')};
      earth.addEventListener('pointerup',stop);earth.addEventListener('pointercancel',stop);
      earth.addEventListener('mouseenter',()=>earth.dataset.hovered='true');earth.addEventListener('mouseleave',()=>delete earth.dataset.hovered);
    }
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
  function drawMiningCalculator(){
    const root=document.querySelector('[data-mining-calculator]');
    if(!root)return;
    const status=root.querySelector('[data-calc-status]'),grossNode=document.querySelector('[data-calc-gross]'),energyNode=document.querySelector('[data-calc-energy]'),powerNode=document.querySelector('[data-calc-power-cost]'),profitNode=document.querySelector('[data-calc-profit]'),paybackNode=document.querySelector('[data-calc-payback]');
    const metrics=miningCalculatorData;
    if(metrics?.status!=='auto'){
      status.textContent='Datos de red no disponibles';
      [grossNode,energyNode,powerNode,profitNode,paybackNode].forEach((node)=>node.textContent='No disponible');
      return;
    }
    const country=root.querySelector('[data-calc-country]'),electricityInput=root.querySelector('[data-calc-electricity]');
    const isManual=country.value==='manual';
    electricityInput.disabled=!isManual;
    const uptime=Math.min(100,Math.max(0,Number(root.querySelector('[data-calc-uptime]').value)||0));
    const pool=Math.min(100,Math.max(0,Number(root.querySelector('[data-calc-pool]').value)||0));
    const cooling=Math.max(0,Number(root.querySelector('[data-calc-cooling]').value)||0);
    const gross=Number(metrics.gross_usd_day)*uptime/100*(1-pool/100);
    const energy=Number(metrics.hardware.power_w)/1000*24*uptime/100*(1+cooling/100);
    grossNode.textContent=PRICE.format(gross);
    energyNode.textContent=`${energy.toLocaleString('es-ES',{maximumFractionDigits:2})} kWh`;
    if(!isManual)return;
    status.textContent='mempool.space · Kaufman Reference Price · BITMAIN';
    const electricityRaw=electricityInput.value.trim();
    if(electricityRaw===''){
      powerNode.textContent='Introduce tu tarifa';profitNode.textContent='—';paybackNode.textContent='Introduce coste';return;
    }
    const electricity=Number(electricityRaw);
    if(!Number.isFinite(electricity)||electricity<0){powerNode.textContent='Tarifa no válida';profitNode.textContent='—';paybackNode.textContent='—';return}
    const powerCost=energy*electricity,profit=gross-powerCost;
    powerNode.textContent=PRICE.format(powerCost);
    profitNode.textContent=PRICE.format(profit);
    profitNode.classList.toggle('positive',profit>=0);profitNode.classList.toggle('negative',profit<0);
    const hardwareRaw=root.querySelector('[data-calc-hardware-cost]').value.trim();
    if(hardwareRaw===''){paybackNode.textContent='Introduce coste';return}
    const hardwareCost=Number(hardwareRaw);
    paybackNode.textContent=Number.isFinite(hardwareCost)&&hardwareCost>=0&&profit>0?`${Math.ceil(hardwareCost/profit).toLocaleString('es-ES')} días`:'No recuperable con estos costes';
  }

  function syncMiningReference(){
    const reference=latestMarketSnapshot?.reference_prices?.bitcoin;
    const referenceFresh=reference?.price&&freshnessFromAge(ageMs(reference.provider_timestamp))==='FRESH';
    if(miningCalculatorData?.status==='auto'&&referenceFresh){
      const grossBtc=Number(miningCalculatorData.gross_btc_day),energy=Number(miningCalculatorData.energy_kwh_day),price=Number(reference.price);
      if(Number.isFinite(grossBtc)&&Number.isFinite(energy)&&energy>0&&Number.isFinite(price)){
        const grossUsd=grossBtc*price;
        miningCalculatorData={...miningCalculatorData,btc_price_usd:price,gross_usd_day:grossUsd,break_even_usd_kwh:grossUsd/energy,price_source:'Kaufman Reference Price · tiempo real'};
        document.querySelectorAll('[data-mining-gross]').forEach((node)=>node.textContent=PRICE.format(grossUsd));
        document.querySelectorAll('[data-mining-break-even]').forEach((node)=>node.textContent=`${SMALL_USD.format(grossUsd/energy)}/kWh`);
        document.querySelectorAll('[data-mining-price-source]').forEach((node)=>node.textContent=`Kaufman Reference Price · ${ageLabel(ageMs(reference.provider_timestamp))}`);
      }
    }
    drawMiningCalculator();
  }

  function updateMiningCalculator(metrics){miningCalculatorData=metrics?{...metrics}:null;syncMiningReference()}

  function initMiningCalculator(){
    const root=document.querySelector('[data-mining-calculator]');
    if(!root)return;
    root.addEventListener('input',drawMiningCalculator);root.addEventListener('change',drawMiningCalculator);drawMiningCalculator();
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
    return `Actualizado hace ${seconds} ${seconds===1?'segundo':'segundos'}`;
  }

  function setFreshness(node,status){
    node?.classList.remove('fresh','stale','degraded','unavailable','na');
    node?.classList.add(status.toLowerCase());
  }

  function refreshMarketDisplay(){
    const references=latestMarketSnapshot?.reference_prices||{};
    const freshAssets=new Set();
    const freshVenues=new Set();
    latestEthUsd=null;
    document.querySelectorAll('[data-market-asset]').forEach((element)=>{
      const reference=references[element.dataset.marketAsset];
      const referenceTimestamp=reference?.received_at||reference?.provider_timestamp;
      const currentAge=referenceTimestamp?ageMs(referenceTimestamp):null;
      const status=reference?.price?freshnessFromAge(currentAge):'UNAVAILABLE';
      const publishable=status==='FRESH'&&Number.isFinite(Number(reference?.price));
      if(publishable){freshAssets.add(element.dataset.marketAsset);(reference.venues||[]).forEach((venue)=>freshVenues.add(venue))}
      if(publishable&&element.dataset.marketAsset==='ethereum')latestEthUsd=Number(reference.price);
      const price=element.querySelector('.kf-market-price'),age=element.querySelector('[data-market-age]'),venues=element.querySelector('[data-market-venues]');
      if(price)price.textContent=publishable?PRICE.format(reference.price):'No disponible';
      if(age){age.textContent=publishable?ageLabel(currentAge):referenceTimestamp?'Actualizando precio…':'Sin precio observado';setFreshness(age,status)}
      if(venues)venues.textContent=publishable?(reference.venues||[]).join(' · '):'Esperando mercados frescos';
      const confidence=element.querySelector('[data-market-confidence]');
      if(confidence){const confidenceLabel={HIGH:'ALTA',MEDIUM:'MEDIA',LOW:'BAJA'}[reference?.confidence]||reference?.confidence;const verificationLabel={VERIFIED:'VERIFICADO',SINGLE_SOURCE:'UNA FUENTE'}[reference?.verification_status]||reference?.verification_status;confidence.textContent=publishable?`${confidenceLabel} · ${verificationLabel}`:'—'}
      const divergence=element.querySelector('[data-market-divergence]');
      if(divergence)divergence.textContent=publishable&&Number.isFinite(reference.metrics?.max_divergence_pct)?`${reference.metrics.max_divergence_pct.toFixed(3)} %`:'—';
    });
    const marketStatus=freshAssets.size===3?`Precios en tiempo real · ${freshVenues.size} mercados`:freshAssets.size?`${freshAssets.size}/3 precios en tiempo real`:'Actualizando precios…';
    document.querySelectorAll('[data-market-status]').forEach((node)=>node.textContent=marketStatus);
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
    setText('[data-gas-status]',valid?`${staticSnapshot&&!liveCadenceMs?'Snapshot público Ethereum':'Ethereum directo'} · ${ageLabel(receivedAge)}${liveCadenceMs?' · actualización automática cada minuto':staticSnapshot?' · respaldo diario':' · actualización cada 15 min'}`:'Comisiones no disponibles: no existe una observación dentro del umbral');
    updateGasCost();
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
    for(const asset of ['bitcoin','ethereum']){
      const row=etf?.assets?.[asset];
      document.querySelectorAll(`[data-etf-latest="${asset}"]`).forEach((node)=>{node.textContent=row?flow(row.latest_net_flow_usd):'No disponible';node.classList.toggle('positive',Number(row?.latest_net_flow_usd)>0);node.classList.toggle('negative',Number(row?.latest_net_flow_usd)<0)});
      document.querySelectorAll(`[data-etf-date="${asset}"]`).forEach((node)=>node.textContent=row?formatDate(row.latest_date):'Fecha no disponible');
    }
    document.querySelectorAll('[data-etf-status]').forEach((node)=>node.textContent=etf?`Actualización automática · ${ageLabel(generatedAge)}`:'Flujos ETF no disponibles');
    const chart=document.querySelector('[data-etf-chart]');
    if(chart){
      const byAsset=Object.fromEntries(['bitcoin','ethereum'].map((asset)=>[asset,new Map((etf?.assets?.[asset]?.series||[]).map((row)=>[row.date,Number(row.net_flow_usd)]))]));
      const dates=[...new Set([...byAsset.bitcoin.keys(),...byAsset.ethereum.keys()])].sort().slice(-12);
      const maximum=Math.max(1,...dates.flatMap((date)=>[Math.abs(byAsset.bitcoin.get(date)||0),Math.abs(byAsset.ethereum.get(date)||0)]));
      chart.innerHTML=dates.length?dates.map((date)=>{const btc=byAsset.bitcoin.get(date),eth=byAsset.ethereum.get(date);const bars=[['btc',btc],['eth',eth]].map(([asset,value])=>{if(!Number.isFinite(value))return '';const height=Math.max(2,Math.abs(value)/maximum*46);return `<i class="${asset} ${value>=0?'positive':'negative'}" style="--bar-height:${height}%" title="${asset==='btc'?'Bitcoin':'Ethereum'} · ${escapeHtml(flow(value))}"></i>`}).join('');return `<div class="kf-etf-day"><div>${bars}</div><small>${new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short'}).format(new Date(`${date}T12:00:00Z`)).replace('.','')}</small></div>`}).join(''):'<div class="kf-live-empty">No hay sesiones publicables.</div>';
      const period=document.querySelector('[data-etf-period]');if(period)period.textContent=dates.length?`${dates.length} sesiones publicadas · BTC y ETH no se suman entre sí`:'Sin periodo disponible';
    }
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
    document.querySelectorAll('[data-exchange-fee-rows]').forEach((root)=>{root.innerHTML=rows.map((row)=>{const exact=row.availability==='PUBLIC_EXACT';const format=(value)=>Number.isFinite(Number(value))?`${Number(value).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:3})} %`:'Según cuenta';return `<tr><td><strong>${escapeHtml(row.exchange)}</strong><small>${exact?'Tabla pública exacta':'Cifra exacta bloqueada'}</small></td><td>${escapeHtml(row.market)}<small>${escapeHtml(row.conditions)}</small></td><td class="number">${format(row.maker_pct)}</td><td class="number">${format(row.taker_pct)}</td><td><a href="${safeExternalUrl(row.source_url)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a></td></tr>`}).join('')||'<tr><td colspan="5">Tarifas no disponibles.</td></tr>'});
    document.querySelectorAll('[data-exchange-fee-status]').forEach((node)=>node.textContent=sourceLabel);
    return rows.length>0;
  }

  function renderProviders(providers={}){
    const root=document.querySelector('[data-provider-grid]');
    if(!root)return;
    const snapshot=latestMarketSnapshot?.delivery_mode==='STATIC_SNAPSHOT';
    const edge=latestMarketSnapshot?.delivery_mode==='LIVE_EDGE';
    const names={coinbase:snapshot?'Coinbase · copia fechada':edge?'Coinbase · mercado público':'Coinbase WebSocket',kraken:snapshot?'Kraken · copia fechada':edge?'Kraken · mercado público':'Kraken WebSocket v2',binance:edge?'Binance · mercado público':'Binance WebSocket',dexscreener:'DEX Screener',coingecko_metadata:'CoinGecko · solo metadatos',defillama_tokenization:'DefiLlama · tokenización',l2beat_projects:'L2BEAT · proyectos L2',ethereum_rpc:'Ethereum RPC',kraken_fees:'Kraken · comisiones'};
    const keys=['coinbase','kraken','binance','dexscreener','coingecko_metadata','defillama_tokenization','l2beat_projects','ethereum_rpc'];
    root.innerHTML=keys.map((key)=>{const item=providers[key]||{},status=item.connection_status||'UNAVAILABLE';const publicStatus=['LIVE','CONNECTED','SNAPSHOT'].includes(status)?'ACTIVA':status==='DEGRADED'?'DEGRADADA':'NO DISPONIBLE';return `<article class="kf-provider-card"><div><span>${escapeHtml(names[key])}</span><i class="kf-health-dot ${status.toLowerCase()}"></i></div><strong>${publicStatus}</strong><small>${item.last_message_at?ageLabel(ageMs(item.last_message_at)):'Sin observación reciente'}</small><dl><div><dt>Observaciones</dt><dd>${Number(item.messages||item.records||0).toLocaleString('es-ES')}</dd></div><div><dt>Entrega</dt><dd>${edge&&['coinbase','kraken','binance'].includes(key)?'≤ 5 s':snapshot?'Fechada':'Server-side'}</dd></div></dl></article>`}).join('');
  }

  function renderStablecoins(stablecoins={}){
    const root=document.querySelector('[data-stablecoin-grid]');
    if(!root)return;
    root.innerHTML=['USDT','USDC'].map((currency)=>{const item=stablecoins[currency],itemAge=ageMs(item?.received_at||item?.provider_timestamp),valid=item?.price&&freshnessFromAge(itemAge)==='FRESH';return `<article class="kf-stable-card"><span>${currency} / USD</span><strong>${valid?Number(item.price).toFixed(6):'No disponible'}</strong><small>${item?.received_at||item?.provider_timestamp?ageLabel(itemAge):'Sin tipo observado'} · ${valid?item.venues.join(' · '):'no se normalizan parejas '+currency}</small></article>`}).join('');
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
    const root=document.querySelector('[data-market-metadata]');
    if(!root)return;
    const compact=new Intl.NumberFormat('es-ES',{notation:'compact',maximumFractionDigits:2});
    const ids=['bitcoin','ethereum','solana'];
    root.innerHTML=ids.map((id)=>{const item=metadata[id],valid=item?.verification_status==='VERIFIED',categories=(item?.categories||[]).slice(0,3).map(escapeHtml).join(' · ');return `<article class="kf-metadata-card"><img src="${assetUrl(`/assets/logos/${id}.svg`)}" alt="Logo de ${escapeHtml(item?.name||id)}"><div><span>${escapeHtml(item?.name||id)}</span><strong>${valid&&Number.isFinite(Number(item.market_cap_usd))?`${compact.format(item.market_cap_usd)} USD`:'No disponible'}</strong><small>Capitalización · ${valid&&Number.isFinite(Number(item.circulating_supply))?`${compact.format(item.circulating_supply)} en circulación`:'oferta no disponible'}</small><p>${valid?(categories||`Metadatos validados · ${ageLabel(ageMs(item.last_updated_at))}`):escapeHtml(item?.exclusion_reason||'Metadato sin timestamp válido')}</p></div></article>`}).join('');
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
    const signature=[data?.received_at,query,segmentValue,networkValue,sortValue,valid].join('|');
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
    const count=document.querySelector('[data-token-product-count]');
    if(count)count.textContent=`${rows.length.toLocaleString('es-ES')} de ${products.length.toLocaleString('es-ES')} productos`;
    root.innerHTML=rows.length?rows.map((product)=>{
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
    if(/calidad|fiable|sabemos|falta|hueco|evidencia/.test(clean))return {title:'La cobertura es cuantitativa, no una verificación del emisor',text:`Se publican ${data.data_quality.published_products} de ${data.data_quality.raw_rwa_records} registros RWA. ${data.data_quality.project_link_coverage_pct.toLocaleString('es-ES',{maximumFractionDigits:1})} % incluye enlace de proyecto y ${data.data_quality.raw_chain_breakdown_mismatch_records} desgloses por red tuvieron que normalizarse.`,method:'No existe timestamp por producto: la pantalla usa hora de recepción y se bloquea tras 24 horas.'};
    if(/stable|dólar|dolar|liquid|rail/.test(clean))return {title:'Las stablecoins son la capa monetaria, no el mismo universo',text:`El rail USD valorado alcanza ${tokenizedUsd(data.kpis.usd_stablecoin_value_usd)}, ${Number(data.ratios.stablecoin_to_rwa_multiple).toLocaleString('es-ES',{maximumFractionDigits:2})} veces el capital RWA rastreado. La variación de oferta valorada en 24 h es ${Number(data.ratios.stablecoin_supply_change_24h_pct).toLocaleString('es-ES',{maximumFractionDigits:3})} %.`,method:'Circulación multiplicada por precio observado; no se presupone paridad 1:1.'};
    if(/mov|cambi|crec|sub|baj|semana/.test(clean))return {title:'Movimiento con umbral de escala',text:gainer&&decliner?`${gainer.name} lidera la expansión con ${Number(gainer.change_7d_pct).toLocaleString('es-ES',{maximumFractionDigits:2})} %, mientras ${decliner.name} registra ${Number(decliner.change_7d_pct).toLocaleString('es-ES',{maximumFractionDigits:2})} %.`:'No hay dos extremos publicables en el universo actual.',method:`Solo productos con al menos ${tokenizedUsd(data.movers.minimum_tvl_usd)}; variación del agregador, no rentabilidad del inversor.`};
    if(/red|ethereum|infra|cadena|l2/.test(clean)){
      const publicRwa=(l2?.projects||[]).filter((project)=>Number(project.rwa_public_usd)>0).sort((a,b)=>b.rwa_public_usd-a.rwa_public_usd)[0];
      return {title:'La red dominante no elimina el riesgo de infraestructura',text:`${topNetwork?.name||'La red líder'} concentra ${Number(topNetwork?.share_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} % de la asignación RWA normalizada.${publicRwa?` En el radar L2BEAT, ${publicRwa.name} lidera el RWA público curado con ${tokenizedUsd(publicRwa.rwa_public_usd)} y figura con ${publicRwa.stage_label_es||'madurez no asignada'}.`:''}`,method:'DefiLlama y L2BEAT mantienen universos distintos; sus valores se muestran juntos, pero nunca se suman.'};
    }
    if(/clase|activo|deuda|bono|tesoro|compos/.test(clean))return {title:'La tokenización actual está dominada por instrumentos financieros',text:`${topSegment?.label||'La clase líder'} representa ${Number(topSegment?.share_of_tracked_rwa_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} % del TVL RWA rastreado mediante ${Number(topSegment?.protocol_count||0).toLocaleString('es-ES')} productos.`,method:'Las etiquetas pueden solaparse; sus importes no deben sumarse entre sí.'};
    return {title:'Un mercado grande, concentrado y todavía incompleto',text:`Kaufman rastrea ${tokenizedUsd(data.kpis.tracked_rwa_tvl_usd)} en ${data.coverage.rwa_protocols} productos. ${topProduct?.name||'El mayor producto'} lidera con ${topProduct?tokenizedUsd(topProduct.value_usd):'valor no disponible'} y el top 5 concentra ${Number(data.ratios.top_5_concentration_pct).toLocaleString('es-ES',{maximumFractionDigits:1})} %.`,method:'Respuesta construida solo con el snapshot conectado; no añade conocimiento externo.'};
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
    const valid=data?.schema_version==='kaufman-wallet-intelligence-v1'&&Number.isFinite(receivedAge)&&receivedAge<=172800000;
    const products=Object.fromEntries((valid?data.products:[]).map((item)=>[item.id,item]));
    document.querySelectorAll('[data-wallet-release]').forEach((node)=>{
      const item=products[node.dataset.walletRelease];
      if(!item){node.textContent=node.dataset.walletRelease==='safe'?'No aplica · configuración onchain':'Release oficial no disponible';return}
      const published=new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(item.published_at));
      node.innerHTML=`<a href="${safeExternalUrl(item.source_url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(item.version)}</strong><span>Publicada ${escapeHtml(published)} ↗</span></a>`;
      node.title=data.methodology||'';
    });
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
    const estimateLabels={CALCULATED:'ESTIMACIÓN CALCULADA',NO_POSITIVE_GAIN:'SIN GANANCIA POSITIVA',DEFERRED:'DIFERIMIENTO ESTIMADO',CONDITIONAL_EXCLUSION:'EXCLUSIÓN CONDICIONADA',PERSONAL_INVESTMENT_EXCLUDED:'INVERSIÓN PERSONAL EXCLUIDA',BELOW_TURNOVER_THRESHOLD:'BAJO UMBRAL DE TURNOVER',CONDITIONAL_PROVISIONAL:'PAGO PROVISIONAL CONDICIONADO'};
    let scenarioSignal=estimate.method||estimate.reason||'La regla oficial conectada se muestra sin calcular una deuda final.';
    if(jurisdiction.id==='espana'&&event.id==='holding'&&custody==='foreign')scenarioSignal='La custodia extranjera activa la revisión de localización y umbrales del Modelo 721.';
    if(outsideScope)scenarioSignal='El contrato conectado cubre personas físicas. No se extrapolan reglas de individuo a sociedades.';
    const calculation=estimateReady?`<section class="kf-fiscal-calculation ${escapeHtml(estimate.status.toLowerCase().replaceAll('_','-'))}"><header><div><span>RESULTADO REPRODUCIBLE · ${escapeHtml(data.calculation_models[jurisdiction.id].year)}</span><h4>${escapeHtml(estimate.result_label)}</h4></div><b>${escapeHtml(estimateLabels[estimate.status]||'ESTIMACIÓN INDICATIVA')}</b></header><div class="kf-fiscal-calculation-grid"><article><span>Ganancia introducida</span><strong>${Number(estimate.gain).toLocaleString('es-ES',{maximumFractionDigits:2})} ${escapeHtml(estimate.currency)}</strong></article><article class="primary"><span>${estimate.status==='CONDITIONAL_PROVISIONAL'?'Pago provisional':'Impacto fiscal incremental'}</span><strong>${Number(estimate.tax_estimate).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})} ${escapeHtml(estimate.currency)}</strong></article><article><span>Tipo efectivo de esta operación</span><strong>${Number.isFinite(estimate.effective_rate)?`${(estimate.effective_rate*100).toLocaleString('es-ES',{maximumFractionDigits:2})} %`:'No equivale a tipo efectivo'}</strong></article><article><span>Base previa informada</span><strong>${priorBase.toLocaleString('es-ES',{maximumFractionDigits:2})} ${escapeHtml(estimate.currency)}</strong></article></div><div class="kf-fiscal-calculation-method"><span>MÉTODO APLICADO</span><strong>${escapeHtml(estimate.method)}</strong><small>Importes introducidos en ${escapeHtml(estimate.currency)}. No se realiza conversión de divisa.</small></div><div class="kf-fiscal-calculation-limits"><span>NO INCLUIDO</span><p>${(estimate.exclusions||[]).map(escapeHtml).join(' · ')}</p></div><div class="kf-fiscal-evidence">${fiscalSourceLinks(data,estimate)}</div></section>`:`<section class="kf-fiscal-calculation pending"><span>PARA OBTENER UNA CIFRA</span><h4>${escapeHtml(estimate.reason||'Faltan datos para aplicar el modelo oficial.')}</h4><p>Los importes deben introducirse en ${escapeHtml(jurisdiction.currency)}. Kaufman no inventa una base ni convierte divisas sin una cotización declarada.</p></section>`;
    root.innerHTML=`<header><div><span>${escapeHtml(jurisdiction.code)} · ${escapeHtml(event.label)} · importes en ${escapeHtml(jurisdiction.currency)}</span><h3>${escapeHtml(jurisdiction.name)}</h3></div><b class="${escapeHtml((outsideScope?'NOT_DETERMINED':fact.status).toLowerCase().replaceAll('_','-'))}">${outsideScope?'FUERA DE COBERTURA':fiscalStatusLabel(fact.status)}</b></header><div class="kf-fiscal-decision"><article><span>¿Activa hecho?</span><strong>${outsideScope?'No concluido':escapeHtml(fact.trigger)}</strong></article><article><span>Categoría</span><strong>${outsideScope?'Requiere contrato societario':escapeHtml(fact.category)}</strong></article><article><span>Mecanismo del tipo</span><strong>${outsideScope?'No se extrapola':escapeHtml(fact.rate)}</strong></article><article><span>Momento</span><strong>${outsideScope?'No determinado':escapeHtml(fact.timing)}</strong></article>${gainApplicable?`<article class="economic"><span>Diferencia económica</span><strong class="${gain>=0?'positive':'negative'}">${gain.toLocaleString('es-ES',{maximumFractionDigits:2})} ${escapeHtml(jurisdiction.currency)}</strong></article>`:''}</div>${calculation}<div class="kf-fiscal-scenario-signal ${outsideScope?'blocked':''}"><span>${outsideScope?'LÍMITE DE COBERTURA':'LECTURA DEL ESCENARIO'}</span><strong>${escapeHtml(scenarioSignal)}</strong></div><div class="kf-fiscal-result-bottom"><div><span>Reporte / evidencia</span><p>${escapeHtml(fact.reporting)}</p><span>Límite jurídico</span><p>${escapeHtml(fact.limitation)}</p></div><div class="kf-fiscal-evidence">${fiscalSourceLinks(data,fact)}</div></div>`;
    fiscalGlobeSelected=jurisdiction.id;
    renderFiscalGlobeSheet(data);
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

  function renderFiscalGlobeSheet(data){
    const root=document.querySelector('[data-fiscal-globe-sheet]');if(!root||!fiscalDataValid(data))return;
    const jurisdiction=data.jurisdictions.find((row)=>row.id===fiscalGlobeSelected)||data.jurisdictions[0];
    const eventId=document.querySelector('[data-fiscal-event]')?.value||'crypto_swap';
    const event=data.events.find((row)=>row.id===eventId)||data.events[0],fact=jurisdiction.facts[event.id];
    root.innerHTML=`<div class="kf-fiscal-globe-country"><span>${escapeHtml(jurisdiction.code)} · ${escapeHtml(jurisdiction.region)}</span><h3>${escapeHtml(jurisdiction.name)}</h3><p>${escapeHtml(jurisdiction.summary)}</p></div><div class="kf-fiscal-globe-fact"><span>${escapeHtml(event.label)}</span><strong>${escapeHtml(fact.trigger)}</strong><p>${escapeHtml(fact.category)}</p><small>${fiscalStatusLabel(fact.status)} · revisión ${escapeHtml(jurisdiction.legal_reviewed_at)}</small></div><div class="kf-fiscal-globe-index">${data.jurisdictions.map((row)=>`<button type="button" class="${row.id===jurisdiction.id?'active':''}" data-fiscal-globe-jump="${escapeHtml(row.id)}">${escapeHtml(row.code)}</button>`).join('')}</div><div class="kf-fiscal-evidence">${fiscalSourceLinks(data,fact)}</div>`;
  }

  function positionFiscalGlobe(data){
    const earth=document.querySelector('[data-fiscal-earth]');if(!earth||!fiscalDataValid(data))return;
    const texture=earth.querySelector('.kf-fiscal-earth-texture');
    const normalized=((fiscalGlobeRotation+180)%360+360)%360-180;
    if(texture)texture.style.backgroundPosition=`${50+normalized/360*100}% 50%`;
    earth.querySelectorAll('[data-fiscal-marker]').forEach((button)=>{
      const jurisdiction=data.jurisdictions.find((row)=>row.id===button.dataset.fiscalMarker);if(!jurisdiction)return;
      const lat=jurisdiction.coordinates.lat*Math.PI/180,relative=(jurisdiction.coordinates.lon-fiscalGlobeRotation)*Math.PI/180;
      const z=Math.cos(lat)*Math.cos(relative),x=50+44*Math.cos(lat)*Math.sin(relative),y=50-44*Math.sin(lat);
      button.style.left=`${x}%`;button.style.top=`${y}%`;button.style.opacity=z>.02?String(.45+.55*z):'0';button.style.transform=`translate(-50%,-50%) scale(${(.72+.35*Math.max(0,z)).toFixed(3)})`;button.style.pointerEvents=z>.05?'auto':'none';button.classList.toggle('active',jurisdiction.id===fiscalGlobeSelected);
    });
  }

  function renderFiscalGlobe(data,focusSelected=false){
    const root=document.querySelector('[data-fiscal-markers]');if(!root||!fiscalDataValid(data))return;
    if(root.dataset.snapshot!==data.generated_at){
      root.dataset.snapshot=data.generated_at;
      root.innerHTML=data.jurisdictions.map((row)=>`<button type="button" data-fiscal-marker="${escapeHtml(row.id)}" aria-label="Abrir ${escapeHtml(row.name)} en el globo fiscal"><i></i><span>${escapeHtml(row.code)}</span></button>`).join('');
    }
    const selected=data.jurisdictions.find((row)=>row.id===fiscalGlobeSelected)||data.jurisdictions[0];
    if(focusSelected)fiscalGlobeRotation=selected.coordinates.lon;
    positionFiscalGlobe(data);renderFiscalGlobeSheet(data);
    if(fiscalGlobeFrame===null){
      let previous=0;
      const animate=(time)=>{
        const earth=document.querySelector('[data-fiscal-earth]');
        if(!earth){fiscalGlobeFrame=null;return}
        const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if(!previous)previous=time;
        if(time-previous>=80){
          if(fiscalGlobeVisible&&!fiscalGlobePaused&&!earth.dataset.hovered&&!reduced){fiscalGlobeRotation+=(time-previous)*.0018;positionFiscalGlobe(latestMarketSnapshot?.fiscal_intelligence)}
          previous=time;
        }
        fiscalGlobeFrame=window.requestAnimationFrame(animate);
      };
      fiscalGlobeFrame=window.requestAnimationFrame(animate);
    }
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
    if(dashboard.dataset.snapshot===data.generated_at){positionFiscalGlobe(data);return}
    dashboard.dataset.snapshot=data.generated_at;
    renderFiscalScenario(data);renderFiscalComparison(data);renderFiscalChanges(data);renderFiscalQuality(data);renderFiscalGlobe(data);
    const methodology=document.querySelector('[data-fiscal-methodology]');if(methodology)methodology.textContent=`${data.methodology} ${data.review_policy}`;
  }

  function renderRegulationIntelligence(snapshot){
    const dashboard=document.querySelector('[data-regulation-dashboard]');if(!dashboard)return;
    const data=snapshot?.regulation_intelligence;
    const valid=data?.schema_version==='kaufman-regulation-intelligence-v1'&&data?.source_contract_version===REGULATION_SOURCE_CONTRACT&&Array.isArray(data.regimes)&&Array.isArray(data.sources)&&data.regimes.length>0;
    const status=document.querySelector('[data-regulation-status]');
    if(!valid){if(status)status.textContent='Actualizando registro regulatorio…';return}
    const currentSnapshot=Date.parse(dashboard.dataset.snapshot||''),incomingSnapshot=Date.parse(data.generated_at||'');
    if(Number.isFinite(currentSnapshot)&&Number.isFinite(incomingSnapshot)&&incomingSnapshot<currentSnapshot)return;
    const quality=data.data_quality||{},sourcesById=new Map(data.sources.map((source)=>[source.id,source]));
    const checked=Number(quality.checked_source_count)||0,sourceCount=Number(quality.source_count)||data.sources.length,reachable=Number(quality.reachable_source_count)||0;
    if(status)status.textContent=checked?`Registro conectado · ${reachable}/${sourceCount} fuentes accesibles`:'Registro cargado · comprobando fuentes oficiales';
    document.querySelectorAll('[data-reg-kpi]').forEach((node)=>{const value=quality[node.dataset.regKpi];node.textContent=Number.isFinite(Number(value))?Number(value).toLocaleString('es-ES'):'—'});
    const reachableNode=document.querySelector('[data-reg-reachable]');if(reachableNode)reachableNode.textContent=checked?`${reachable}/${sourceCount}`:'Comprobando';
    const signed=document.querySelector('[data-reg-signed]');if(signed)signed.textContent=`${Number(quality.signed_regime_count||0).toLocaleString('es-ES')} / ${Number(quality.regime_count||data.regimes.length).toLocaleString('es-ES')}`;
    if(dashboard.dataset.snapshot===data.generated_at)return;
    dashboard.dataset.snapshot=data.generated_at;
    const events=document.querySelector('[data-regulation-events]');
    if(events)events.innerHTML=data.events.map((event)=>{
      const source=sourcesById.get(event.source_ids?.[0]);
      const date=new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${event.effective_date}T12:00:00Z`));
      return `<article class="kf-reg-event"><div><time datetime="${escapeHtml(event.effective_date)}">${date}</time>${statusBadge('verified')}</div><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.impact)}</p><footer><span>${escapeHtml(event.jurisdiction)} · ${escapeHtml(event.category)} · impacto ${escapeHtml(event.importance)}</span>${source?`<a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.authority)} ↗</a>`:''}</footer></article>`;
    }).join('');
    const sourceRoot=document.querySelector('[data-regulation-sources]');
    if(sourceRoot)sourceRoot.innerHTML=data.sources.map((source)=>{
      const connected=source.connection_status==='CONNECTED',pending=source.connection_status==='NOT_CHECKED';
      const badge=pending?'<span class="kf-status unverified">COMPROBANDO</span>':connected?'<span class="kf-status auto">FUENTE PÚBLICA CONECTADA</span>':'<span class="kf-status offline">FUENTE TEMPORALMENTE INACCESIBLE</span>';
      const observed=source.checked_at?`Observada ${ageLabel(ageMs(source.checked_at))}`:'Comprobación en curso';
      const bindingLabel=REGULATION_LEVEL_LABELS[source.binding_level]||source.binding_level;
      return `<article class="kf-reg-source"><div><strong>${escapeHtml(source.authority)}</strong>${badge}</div><span>${escapeHtml(source.title)}</span><small>${escapeHtml(bindingLabel)} · ${escapeHtml(observed)}</small><a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a></article>`;
    }).join('');
    const regimeRoot=document.querySelector('[data-regulation-regimes]');
    if(regimeRoot)regimeRoot.innerHTML=data.regimes.map((regime)=>{
      const state=regime.state==='TRANSITION_ENDED'?'TRANSICIÓN FINALIZADA':regime.state==='ENACTED'?'PROMULGADA':regime.state==='IN_FORCE_AND_TRANSITION'?'EN VIGOR · CAMBIO PROGRAMADO':'EN VIGOR';
      const links=regime.source_ids.map((id)=>sourcesById.get(id)).filter(Boolean).map((source)=>`<a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.authority)} ↗</a>`).join('');
      const signedReview=regime.review_status==='SIGNED',reviewLabel=signedReview?'REVISIÓN JURÍDICA FIRMADA':regime.legal_reviewed_at?`REVISIÓN ${regime.legal_reviewed_at} · FIRMA PENDIENTE`:`FUENTE VERIFICADA ${regime.source_verified_at} · FIRMA PENDIENTE`;
      return `<article class="kf-reg-regime"><header><span>${escapeHtml(regime.code)} · ${escapeHtml(regime.jurisdiction)}</span>${statusBadge(signedReview?'verified':'sourcechecked')}</header><h3>${escapeHtml(regime.name)}</h3><div class="kf-reg-state">${escapeHtml(state)} · ${escapeHtml(regime.effective)}</div><dl><div><dt>Autoridad</dt><dd>${escapeHtml(regime.authority)}</dd></div><div><dt>Perímetro</dt><dd>${escapeHtml(regime.scope)}</dd></div><div><dt>Efecto operativo</dt><dd>${escapeHtml(regime.practical_effect)}</dd></div><div><dt>Límite</dt><dd>${escapeHtml(regime.limitation)}</dd></div></dl><footer>${links}<small>${escapeHtml(reviewLabel)}</small></footer></article>`;
    }).join('');
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
      for(const [period,key] of [['7d','change_7d_pct'],['30d','change_30d_pct'],['365d','change_365d_pct']]){
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
      processing_ms:snapshot.processing_ms,
      status:snapshot.status,
      reference_prices:snapshot.reference_prices,
      stablecoin_fx:snapshot.stablecoin_fx||{},
      providers:{...(latestMarketSnapshot?.providers||{}),...providers},
      thresholds:{...(latestMarketSnapshot?.thresholds||{}),...(snapshot.thresholds||{})}
    };
    antennaConnected=true;
    refreshMarketDisplay();
    renderProviders(latestMarketSnapshot.providers);
    renderStablecoins(latestMarketSnapshot.stablecoin_fx);
    renderEcosystemMap(latestMarketSnapshot);
    const method=latestMarketSnapshot.reference_prices?.bitcoin?.methodology;
    document.querySelectorAll('[data-market-methodology]').forEach((node)=>node.textContent=method?`Mediana de mercados frescos · volumen mínimo ${Number(method.minimum_volume_usd_24h).toLocaleString('es-ES')} USD · divergencia ≤ ${method.divergence_threshold_pct} % · proveedores consultados server-side.`:'Metodología pendiente');
    syncMiningReference();
    return true;
  }

  async function pollMarketEdge(){
    if(marketEdgeRequest||document.hidden)return;
    marketEdgeRequest=(async()=>{
      try{
        const response=await fetch(MARKET_EDGE_ENDPOINT,{headers:{Accept:'application/json'}});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const snapshot=await response.json();
        if(!applyLiveMarketSnapshot(snapshot))throw new Error('Respuesta de mercado no válida');
      }catch(error){
        antennaConnected=false;
        refreshMarketDisplay();
      }finally{marketEdgeRequest=null}
    })();
    return marketEdgeRequest;
  }

  function startMarketEdgePolling(){
    if(marketEdgeTimer)return;
    pollMarketEdge();
    marketEdgeTimer=window.setInterval(pollMarketEdge,3000);
  }

  async function pollMarketContext(){
    if(marketContextRequest||document.hidden||!document.querySelector('[data-market-context]'))return;
    marketContextRequest=(async()=>{
      try{
        const response=await fetch(pollingUrl(MARKET_CONTEXT_ENDPOINT,300000),{headers:{Accept:'application/json'},cache:'no-store'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const context=await response.json();
        if(context?.delivery_mode!=='LIVE_EDGE_CONTEXT')throw new Error('Respuesta de contexto no válida');
        latestMarketSnapshot={...(latestMarketSnapshot||{}),market_context:context};
        renderMarketContext(context);
      }catch(error){}finally{marketContextRequest=null}
    })();
    return marketContextRequest;
  }

  function startMarketContextPolling(){
    if(marketContextTimer||!document.querySelector('[data-market-context]'))return;
    pollMarketContext();
    marketContextTimer=window.setInterval(pollMarketContext,60000);
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
    if(panel){panel.setAttribute('aria-labelledby',`ecosystem-tab-${territoryId}`);panel.innerHTML=ecosystemPanelMarkup(territoryId,latestMarketSnapshot);localizeRenderedLinks(panel)}
  }

  function renderEcosystemMap(snapshot){
    const root=document.querySelector('[data-ecosystem]');
    if(!root)return;
    const connectedProviders=Object.values(snapshot?.providers||{}).filter((provider)=>['LIVE','CONNECTED','SNAPSHOT'].includes(provider?.connection_status)).length;
    document.querySelectorAll('[data-engine-state]').forEach((node)=>node.innerHTML=`<i></i> ${connectedProviders||'—'} fuentes activas`);
    const references=Object.values(snapshot?.reference_prices||{});
    const regulation=snapshot?.regulation_intelligence||{};
    const fiscal=snapshot?.fiscal_intelligence||{};
    const observedAt=snapshot?.generated_at||snapshot?.tokenization_markets?.received_at||snapshot?.l2_intelligence?.received_at;
    const observed=observedAt&&!Number.isNaN(Date.parse(observedAt))?new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(new Date(observedAt)).replace('.','').toUpperCase()+' UTC':'HORA NO DISPONIBLE';
    const signals={
      updated:`ACT. ${observed}`,
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
    if(!document.querySelector('[data-market-asset],[data-gas-price],[data-gas-base],[data-l2-projects],[data-tokenization-dashboard],[data-fiscal-dashboard],[data-regulation-dashboard],[data-wallet-release],[data-kraken-maker],[data-provider-grid]'))return;
    if(document.querySelector('[data-wallet-release]')&&!document.querySelector('[data-market-asset],[data-gas-price],[data-gas-base],[data-l2-projects],[data-tokenization-dashboard],[data-fiscal-dashboard],[data-regulation-dashboard],[data-kraken-maker],[data-provider-grid]')){
      await loadPlatformFallback();
      return;
    }
    antennaStream?.close();
    if(marketEdgeTimer){window.clearInterval(marketEdgeTimer);marketEdgeTimer=null}
    antennaConnected=false;
    await loadPlatformFallback();
    if(FILE_ROOT||!('EventSource' in window)){
      document.querySelectorAll('[data-market-status]').forEach((node)=>node.textContent='Actualizando precios…');
      refreshMarketDisplay();
      await loadPlatformFallback();
      startMarketEdgePolling();
      return;
    }
    antennaStream=new EventSource(ANTENNA_STREAM);
    antennaStream.addEventListener('snapshot',(event)=>{
      try{if(!applyLiveMarketSnapshot(JSON.parse(event.data)))throw new Error('Snapshot SSE no válido')}catch(error){antennaConnected=false;refreshMarketDisplay()}
    });
    antennaStream.onopen=()=>{antennaConnected=true;refreshMarketDisplay()};
    antennaStream.onerror=()=>{antennaConnected=false;refreshMarketDisplay();window.setTimeout(()=>{if(!antennaConnected)pollMarketEdge()},1250)};
  }

  function safeExternalUrl(value){
    try{const url=new URL(value);return url.protocol==='https:'?url.href:'#'}catch(error){return '#'}
  }

  function feedDateParts(value){
    const date=new Date(value),now=new Date();
    if(Number.isNaN(date.getTime()))return {day:'—',time:'—',full:'Fecha no disponible'};
    const sameDay=date.getFullYear()===now.getFullYear()&&date.getMonth()===now.getMonth()&&date.getDate()===now.getDate();
    return {
      day:sameDay?'HOY':new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short'}).format(date).replace('.','').toUpperCase(),
      time:new Intl.DateTimeFormat('es-ES',{hour:'2-digit',minute:'2-digit'}).format(date),
      full:new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'numeric'}).format(date)
    };
  }

  function feedItemMarkup(item,index=0){
    const date=feedDateParts(item.published),url=safeExternalUrl(item.url),status=['verified','sourcechecked'].includes(item.status)?item.status:'unverified';
    const translation=item.translated?'<span>Traducido al castellano · titular original en la fuente</span>':'';
    const statusCopy=item.verification_status==='CALCULATED_FROM_PUBLIC_SOURCES'?'Cálculo conectado':item.verification_status==='OFFICIAL_SOURCE_MONITORED'?'Fuente oficial monitorizada':({verified:'Fuente primaria',sourcechecked:'Fuente contrastada',unverified:'Cobertura periodística'}[status]);
    const dateVerb=item.date_verb||'publicado';
    return `<article class="kf-feed-item ${index===0?'lead':'secondary'}"><div class="kf-feed-time"><strong>${date.day}</strong><span>${date.time}</span></div><div class="kf-feed-body"><div class="kf-feed-meta"><span>${escapeHtml(item.jurisdiction||'Global')}</span><span>${escapeHtml(item.category||'ACTUALIDAD')}</span><span>Impacto ${escapeHtml(item.importance||'informativo')}</span></div><a class="kf-feed-title" href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a><p>${escapeHtml(item.publisher)} · ${escapeHtml(dateVerb)} ${date.full}</p><div class="kf-feed-context">${translation}<span class="kf-feed-verification ${status}"><i></i>${escapeHtml(statusCopy)}</span><a href="${url}" target="_blank" rel="noopener noreferrer">Abrir fuente ↗</a></div></div><button class="kf-feed-star" type="button" data-feed-star data-feed-key="${escapeHtml(url)}" aria-label="Guardar señal" title="Guardar señal">☆</button></article>`;
  }

  function renderHomeCurrentAffairs(data){
    const regulationRoot=document.querySelector('[data-home-regulation]');
    if(regulationRoot){
      const regulation=(data?.home_regulation||[]).slice(0,3);
      const cards=regulation.map(feedItemMarkup).join('');
      const missing=3-regulation.length;
      regulationRoot.innerHTML=`<div class="kf-feed-list kf-editorial-feed">${cards}${missing>0?`<div class="kf-live-empty">${missing===3?'No hay cambios regulatorios fiables para publicar.':`Faltan ${missing} señales fiables; Kaufman no completa el bloque con contenido antiguo.`}</div>`:''}</div>`;
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
      metricsMarkup=`<aside class="kf-mining-metrics"><div class="kf-mining-metrics-head"><div><span>Referencia de rentabilidad</span><h3>${escapeHtml(hardware.model)}</h3></div>${statusBadge('auto')}</div><div class="kf-mining-kpis"><div><span>Ingreso bruto / día</span><strong data-mining-gross>${Number.isFinite(gross)?PRICE.format(gross):'—'}</strong></div><div><span>Electricidad de equilibrio</span><strong data-mining-break-even>${Number.isFinite(breakEven)?`${SMALL_USD.format(breakEven)}/kWh`:'—'}</strong></div><div><span>Hashrate de red</span><strong>${Number.isFinite(network)?`${network.toFixed(1)} EH/s`:'—'}</strong></div></div><div class="kf-hardware-spec"><span>Equipo de referencia</span><strong>${Number(hardware.hashrate_th_s).toLocaleString('es-ES')} TH/s · ${Number(hardware.power_w).toLocaleString('es-ES')} W</strong><a href="${safeExternalUrl(hardware.source_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(hardware.source)} ↗</a></div><details class="kf-mining-method"><summary>Ver método y fuentes</summary><p>Modelo teórico a 144 bloques/día y subsidio de ${Number(metrics.block_subsidy_btc).toLocaleString('es-ES')} BTC. No incluye comisiones del pool, tarifas de red, paradas, refrigeración, impuestos ni coste eléctrico.</p><div class="kf-metric-sources"><a href="${safeExternalUrl(metrics.network_source_url)}" target="_blank" rel="noopener noreferrer">mempool.space ↗</a><a href="${priceSourceUrl}" rel="noopener noreferrer" data-mining-price-source>${escapeHtml(metrics.price_source||'Referencia de precio')} ↗</a></div></details></aside>`;
    }
    miningRoot.innerHTML=`<div class="kf-feed-list compact kf-editorial-feed">${newsCards}${missingNews>0?`<div class="kf-live-empty">${missingNews===2?'No hay noticias mineras fiables publicadas dentro de 24 horas.':`Falta ${missingNews} noticia dentro de 24 horas; no se sustituye por contenido antiguo.`}</div>`:''}</div>`;
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

  function initConsent(){
    document.querySelector('[data-consent-manage]')?.addEventListener('click',()=>{try{window.localStorage.removeItem('kaufman_analytics_consent')}catch(error){}window.location.reload()});
    let preference=null;
    try{preference=window.localStorage.getItem('kaufman_analytics_consent')}catch(error){preference=null}
    if(preference==='accepted'){loadAnalytics();return}
    if(preference==='rejected')return;
    const banner=document.createElement('aside');
    banner.className='kf-consent';
    banner.setAttribute('aria-label','Preferencias de analítica');
    banner.innerHTML='<div><strong>Analítica opcional</strong><p>Kaufman usa GA4, GTM y GoatCounter para medir el uso. No se activan hasta que aceptes.</p></div><div class="kf-consent-actions"><button class="kf-button small secondary" type="button" data-consent-reject>Rechazar</button><button class="kf-button small primary" type="button" data-consent-accept>Aceptar</button></div>';
    document.body.appendChild(banner);
    const decide=(value)=>{try{window.localStorage.setItem('kaufman_analytics_consent',value)}catch(error){}banner.remove();if(value==='accepted')loadAnalytics()};
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
      mineria:{verb:'Evaluar una operación minera',summary:'Cruza hardware, electricidad, red, disponibilidad, fiscalidad y sensibilidad de la rentabilidad.',checks:['Equipo, stock y rendimiento','Electricidad y coste operativo','Fiscalidad, red y sensibilidad'],route:'/herramientas/#rentabilidad-minera'}
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

  const page=new URLSearchParams(location.search).get('pagina')||document.body.dataset.page||'home';
  const app=document.getElementById('kaufman-app');
  const commercialPages=!['contacto','aviso','privacidad','terminos','retirado'].includes(page);
  const renderedPage=renderPage(page);
  const pageWithClose=commercialPages?renderedPage.replace('</main>',`${decisionCloseMarkup(page)}</main>`):renderedPage;
  app.innerHTML=`<div class="kf-shell">${headerMarkup(page)}${pageWithClose}${footerMarkup()}</div>${searchOverlayMarkup()}`;
  localizeRenderedLinks(app);
  const pageTitle=page==='home'?'Kaufman | Inteligencia blockchain':`${CATALOGS[page]?.label||({mercados:'Mercados',tokenizacion:'Tokenización',herramientas:'Herramientas',rentabilidades:'Rentabilidades',ficha:'Ficha',fichas:'Fichas',fuentes:'Fuentes',contacto:'Contacto',aviso:'Aviso legal',privacidad:'Política de privacidad',terminos:'Términos de uso'}[page]||'Kaufman')} | Kaufman`;
  document.title=pageTitle;
  initMenu();initSearch();initDirectoryFilters();initTokenizationFilters();initFiscalDashboard();initComparator();initFeedStars();initMiningCalculator();initJurisdictionTool();initCountryCostStack();initEcosystemMap();initDecisionBrief();initContact();initReveal();
  Promise.resolve(connectMarketAntenna()).finally(()=>{startMarketContextPolling();startGasEdgePolling()});
  loadRegulationFallback();
  if(document.querySelector('[data-market-asset]'))window.setInterval(refreshMarketDisplay,1000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)return;if(marketEdgeTimer)pollMarketEdge();if(marketContextTimer)pollMarketContext();if(gasEdgeTimer)pollGasEdge()});
  loadDailySnapshot();
  initConsent();
})();
