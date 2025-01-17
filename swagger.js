import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Welcome to Ureshii RestFull API',
      version: '1.0.0',
      description: 'Dokumentasi untuk API Ureshii',
    },
    servers: [
      {
        url: `https://api.ureshii.my.id`,
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

function generateJSDocTemplate(routePath, routeCode) {
  const tag = routePath.split('/')[2];
  const queryParams = [];
  const responseExample = {};

  const queryParamMatches = routeCode.match(/req\.query\.(\w+)/g);
  if (queryParamMatches) {
    queryParamMatches.forEach((match) => {
      const paramName = match.split('.')[2];
      if (!queryParams.includes(paramName)) {
        queryParams.push(paramName);
      }
    });
  }

  if (routeCode.includes('res.status(200).json(')) {
    const responseMatch = routeCode.match(/res\.status\(200\)\.json\(([\s\S]*?)\);/);
    if (responseMatch) {
        const responseObjStr = responseMatch[1].trim();

        if (responseObjStr.startsWith('{') && responseObjStr.endsWith('}')) {
            const props = responseObjStr.slice(1, -1).split(',');
            props.forEach(prop => {
                const [key, value] = prop.split(':').map(s => s.trim());
                if (key && value) {
                  responseExample[key.replace(/['"]/g, '')] = inferType(value);
                }
            });
        } else if (responseObjStr.startsWith('[') && responseObjStr.endsWith(']')) {
          responseExample.type = 'array'
        } else {
          responseExample.data = '<' + typeof responseObjStr + '>'
        }
    }
}

  let scrapingInfo = '';
  if (routeCode.includes('axios.get') && routeCode.includes('cheerio.load')) {
    scrapingInfo = `
 *     description: Endpoint ini melakukan scraping data dari website.
 *                 Data yang di-scrape mungkin berubah sewaktu-waktu.`;
  }

  return `
/**
 * @swagger
 * ${routePath}:
 *   get:
 *     summary: Deskripsi singkat untuk ${routePath}
 *     tags: [${tag}]
 *     parameters:${queryParams.length > 0 ? queryParams.map(param => `
 *       - in: query
 *         name: ${param}
 *         schema:
 *           type: string
 *         required: false
 *         description: Deskripsi untuk parameter ${param}`).join('') : ''}
 *     ${scrapingInfo}
 *     responses:
 *       200:
 *         description: Sukses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: ${JSON.stringify(responseExample, null, 2).split('\n').map((line, index) => index > 0 ? `                 ${line}` : `${line}`).join('\n')}
 *       500:
 *         description: Kesalahan server
 */
`;
}

function inferType(value) {
    if (!isNaN(value)) {
        return 'number';
    } else if (value === 'true' || value === 'false') {
        return 'boolean';
    } else if (value.startsWith("'") || value.startsWith('"')) {
      return 'string'
    } else if (value.startsWith('{')) {
      return '{...}'
    } else if (value.startsWith('[')) {
      return '[...]'
    } else {
        return 'unknown';
    }
}

const app = express()
const apiKeyMiddleware = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey) {
      return res
        .status(400)
        .json({ message: 'API Key tidak ditemukan dalam header request.' });
    }

    if (apiKey !== validApiKey) {
      return res.status(401).json({ message: 'API Key tidak valid.' });
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Terjadi kesalahan saat validasi API Key.' });
  }
};

async function generateDynamicApiDocs() {
  const apiDir = path.join(__dirname, 'routes-fitur');
  const apis = ['./routes/*.js'];
  const routes = {};

  async function traverseDir(directory, category = '') {
    console.log('Traversing:', directory);
    const files = await fs.promises.readdir(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = await fs.promises.stat(filePath);
      console.log("Checking:", filePath);
      if (stat.isDirectory()) {
        await traverseDir(filePath, category ? `${category}/${file}` : file);
      } else if (file.endsWith('.js')) {
        const routeName = file.replace('.js', '');
        const fullCategory = category ? `api/${category}` : 'api';
        const routePath = `/${fullCategory}/${routeName}`;
        console.log("route :", routePath)
        if (!routes[fullCategory]) {
          routes[fullCategory] = [];
        }
        routes[fullCategory].push(routePath);

        const moduleUrl = new URL(filePath, `file://${__dirname}/`).href;
        try {
          const module = await import(moduleUrl);
          const route = module.default;

          const fileContent = fs.readFileSync(filePath, 'utf-8');
          if (!fileContent.includes('@swagger')) {
            let jsdocTemplate = '';
            route.stack.forEach((layer) => {
              if (layer.route) {
                const methods = Object.keys(layer.route.methods)
                .filter((method) => layer.route.methods[method])

                methods.forEach((method) => {
                    jsdocTemplate += generateJSDocTemplate(routePath, fileContent);
                })
              }
            });

            const updatedContent = fileContent.replace(
              /(router\.(get|post|put|delete|patch)\()/,
              jsdocTemplate + '\n$1'
            );
            fs.writeFileSync(filePath, updatedContent);
          }

          app.use(
            routePath,
            (req, res, next) => {
              req.isFromRouteFitur = true;
              next();
            },
            route
          );
        } catch (err) {
          console.error(`Failed to load route ${routePath}:`, err);
        }
      }
    }
  }

  async function loadRoutes() {
    await traverseDir(apiDir);
    return routes
  }

  await loadRoutes()

  const swaggerSpec = swaggerJSDoc({ ...options, apis }); // Pindahkan swaggerJSDoc ke sini

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.use('/docs/private', apiKeyMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return swaggerSpec
}

const dynamicSwaggerSpec = await generateDynamicApiDocs();

export default dynamicSwaggerSpec;
export { loadRoutes };