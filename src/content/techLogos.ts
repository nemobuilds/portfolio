import angularSvg from '../assets/logos/angular-original.svg'
import azureSvg from '../assets/logos/azure-original.svg'
import csharpSvg from '../assets/logos/csharp-original.svg'
import css3Svg from '../assets/logos/css3-original.svg'
import dockerSvg from '../assets/logos/docker-original.svg'
import dot_netSvg from '../assets/logos/dot-net-original.svg'
import fastapiSvg from '../assets/logos/fastapi-original.svg'
import gitSvg from '../assets/logos/git-original.svg'
import html5Svg from '../assets/logos/html5-original.svg'
import javaSvg from '../assets/logos/java-original.svg'
import javascriptSvg from '../assets/logos/javascript-original.svg'
// JMeter: Simple Icons (CC0), filled with the Apache JMeter red. The others are Devicon (MIT).
import jmeterSvg from '../assets/logos/jmeter-original.svg'
import mysqlSvg from '../assets/logos/mysql-original.svg'
import phpSvg from '../assets/logos/php-original.svg'
import postgresqlSvg from '../assets/logos/postgresql-original.svg'
import postmanSvg from '../assets/logos/postman-original.svg'
import pythonSvg from '../assets/logos/python-original.svg'
import reactSvg from '../assets/logos/react-original.svg'
import springSvg from '../assets/logos/spring-original.svg'
import swaggerSvg from '../assets/logos/swagger-original.svg'
import tailwindcssSvg from '../assets/logos/tailwindcss-original.svg'
import typescriptSvg from '../assets/logos/typescript-original.svg'

export type TechLogo = { kind: 'logo'; src: string } | { kind: 'chain' } | { kind: 'code' }

const logos: Record<string, string> = {
  'Angular': angularSvg,
  'Azure': azureSvg,
  'C#': csharpSvg,
  'CSS': css3Svg,
  'Docker': dockerSvg,
  '.NET': dot_netSvg,
  'FastAPI': fastapiSvg,
  'Git': gitSvg,
  'HTML': html5Svg,
  'Java': javaSvg,
  'JavaScript': javascriptSvg,
  'JMeter': jmeterSvg,
  'MySQL': mysqlSvg,
  'PHP': phpSvg,
  'PostgreSQL': postgresqlSvg,
  'Postman': postmanSvg,
  'Python': pythonSvg,
  'React': reactSvg,
  'Spring Boot': springSvg,
  'Swagger': swaggerSvg,
  'Tailwind CSS': tailwindcssSvg,
  'TypeScript': typescriptSvg,
}

export function techLogo(name: string): TechLogo {
  const src = logos[name]
  if (src) return { kind: 'logo', src }
  if (name === 'LangChain') return { kind: 'chain' }
  return { kind: 'code' }
}
