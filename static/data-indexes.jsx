// 40 indexes with realistic ingestion metadata + haystack-style configs

(function () {
  const NAMED = [
    'HR', 'Legal', 'Finance', 'Engineering', 'Sales', 'Marketing', 'Compliance',
    'Customer-Support', 'Procurement', 'Security', 'Data-Science', 'Product',
    'Operations', 'Research', 'Clinical-Ops',
  ];
  const STATUSES = ['success', 'success', 'success', 'success', 'running', 'failed', 'queued', 'success'];
  const CONNECTORS = ['sharepoint', 'confluence', 's3', 'gdrive', 'notion', 'jira', 'salesforce', 'gitlab', 'web-crawler', 'sql'];
  const EMBEDDERS = [
    'text-embedding-3-large',
    'text-embedding-3-small',
    'voyage-large-2',
    'bge-large-en-v1.5',
    'cohere-embed-v3',
  ];
  const SPLITTERS = ['recursive', 'sentence', 'token', 'markdown'];
  const OWNERS = ['aisha.rao', 'martin.cole', 'priya.s', 'devon.h', 'jules.k', 'rohan.p'];

  function pick(arr, i) { return arr[i % arr.length]; }
  function rand(seed) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }

  const INDEXES = [];

  // First 15 are named domains
  for (let i = 0; i < 40; i++) {
    const r = rand(i + 1);
    const r2 = rand(i + 100);
    const name = i < NAMED.length ? NAMED[i] : `index-${i - NAMED.length + 1}`;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const status = pick(STATUSES, i + Math.floor(r * 7));
    const docs = Math.floor(800 + r * 38000);
    const chunks = Math.floor(docs * (12 + r2 * 14));
    const sizeMb = Math.floor(40 + r * 4500);

    const lastUpdate = (() => {
      const min = Math.floor(r2 * 60 * 24 * 14); // up to 14d ago
      if (min < 60) return `${min}m ago`;
      if (min < 60 * 24) return `${Math.floor(min / 60)}h ago`;
      return `${Math.floor(min / (60 * 24))}d ago`;
    })();

    INDEXES.push({
      id,
      name,
      version: `v${1 + Math.floor(r * 5)}.${Math.floor(r2 * 9)}`,
      status,
      docs,
      chunks,
      sizeMb,
      lastUpdate,
      lastDuration: `${Math.floor(2 + r * 58)}m ${Math.floor(r2 * 60)}s`,
      connector: pick(CONNECTORS, i),
      embedder: pick(EMBEDDERS, i),
      splitter: pick(SPLITTERS, i),
      chunkSize: pick([256, 384, 512, 768, 1024], i),
      chunkOverlap: pick([0, 32, 64, 128], i),
      vectorDim: pick([768, 1024, 1536, 3072], i),
      vectorStore: pick(['weaviate', 'qdrant', 'pinecone', 'opensearch', 'pgvector'], i),
      owner: pick(OWNERS, i),
      lastJob: `#${4200 + i * 3}`,
      schedule: pick(['Daily 02:00 UTC', 'Hourly', 'On-demand', 'Weekly Sun 03:00'], i),
      sourceUri: pick([
        'sharepoint://contoso/HR-Documents',
        'confluence://corp/Policies',
        's3://kb-prod/legal/',
        'gdrive://shared/Engineering Wiki',
        'notion://workspace/Product',
      ], i),
      tags: pick([['policy'], ['internal'], ['internal', 'q-restricted'], ['public-faq'], ['compliance', 'sox'], ['research']], i),
      createdBy: pick(OWNERS, i + 1),
      createdAt: `${Math.floor(15 + r * 250)}d ago`,
    });
  }

  // Sample docs in an index
  const INDEX_DOCS = [
    { name: 'employee-handbook-2025.pdf', size: '4.2 MB', tokens: 28400, type: 'pdf', updated: '3d ago' },
    { name: 'leave-policy-v3.md',          size: '12 KB',  tokens: 1820,  type: 'md',  updated: '1d ago' },
    { name: 'remote-work-policy.docx',     size: '120 KB', tokens: 4100,  type: 'docx',updated: '8d ago' },
    { name: 'benefits-overview-FY26.pdf',  size: '2.1 MB', tokens: 11200, type: 'pdf', updated: '5d ago' },
    { name: 'code-of-conduct.pdf',         size: '880 KB', tokens: 6400,  type: 'pdf', updated: '21d ago'},
    { name: 'parental-leave-2025.md',      size: '8 KB',   tokens: 980,   type: 'md',  updated: '2d ago' },
    { name: 'compensation-bands.xlsx',     size: '340 KB', tokens: 0,     type: 'xlsx',updated: '4d ago' },
    { name: 'onboarding-checklist.md',     size: '6 KB',   tokens: 720,   type: 'md',  updated: '12d ago'},
  ];

  // Groovy/Jenkinsfile ingestion pipeline config
  const HAYSTACK_YAML = `pipeline {
  agent { label 'rag-worker' }

  parameters {
    string(name: 'INDEX_NAME',    defaultValue: 'hr',                   description: 'Target index identifier')
    string(name: 'SOURCE_URI',    defaultValue: 'sharepoint://contoso/HR-Documents', description: 'Source connector URI')
    choice(name: 'SPLITTER',      choices: ['recursive','sentence','token','markdown'], description: 'Document splitter strategy')
    string(name: 'CHUNK_SIZE',    defaultValue: '512',                  description: 'Chunk size in tokens')
    string(name: 'CHUNK_OVERLAP', defaultValue: '64',                   description: 'Chunk overlap in tokens')
    string(name: 'EMBEDDER',      defaultValue: 'text-embedding-3-large', description: 'Embedding model')
    string(name: 'VECTOR_STORE',  defaultValue: 'weaviate',             description: 'Vector store backend')
    booleanParam(name: 'FULL_REINDEX', defaultValue: false,             description: 'Force full re-ingestion')
  }

  environment {
    VECTOR_HOST   = credentials('vector-store-host')
    SP_CLIENT_ID  = credentials('sharepoint-client-id')
    SP_TENANT_ID  = credentials('sharepoint-tenant-id')
    SP_SECRET     = credentials('sharepoint-client-secret')
  }

  stages {
    stage('Fetch documents') {
      steps {
        script {
          sh """
            python -m connectors.sharepoint \\\\
              --uri      \${params.SOURCE_URI} \\\\
              --out-dir  ./raw \\\\
              --tenant   \${SP_TENANT_ID} \\\\
              --client   \${SP_CLIENT_ID} \\\\
              --secret   \${SP_SECRET} \\\\
              \${params.FULL_REINDEX ? '--full' : '--incremental'}
          """
        }
      }
    }

    stage('Preprocess & split') {
      steps {
        sh """
          python -m pipeline.split \\\\
            --input      ./raw \\\\
            --output     ./chunks \\\\
            --strategy   \${params.SPLITTER} \\\\
            --chunk-size \${params.CHUNK_SIZE} \\\\
            --overlap    \${params.CHUNK_OVERLAP}
        """
      }
    }

    stage('Embed & index') {
      steps {
        sh """
          python -m pipeline.embed \\\\
            --input        ./chunks \\\\
            --model        \${params.EMBEDDER} \\\\
            --vector-store \${params.VECTOR_STORE} \\\\
            --vector-host  \${VECTOR_HOST} \\\\
            --index        \${params.INDEX_NAME}
        """
      }
    }

    stage('Validate') {
      steps {
        sh "python -m pipeline.validate --index \${params.INDEX_NAME} --min-docs 100"
      }
    }
  }

  post {
    success { echo "Index \${params.INDEX_NAME} updated successfully." }
    failure { slackSend channel: '#rag-alerts', message: "Ingestion failed for \${params.INDEX_NAME}" }
  }
}`;

  const CONNECTOR_LIST = [
    { id: 'sharepoint', name: 'SharePoint',  desc: 'Microsoft 365 sites, lists, libraries', popular: true },
    { id: 'confluence', name: 'Confluence',  desc: 'Atlassian wikis & spaces',              popular: true },
    { id: 's3',         name: 'Amazon S3',   desc: 'Object storage buckets & prefixes',     popular: true },
    { id: 'gdrive',     name: 'Google Drive',desc: 'Shared drives, folders, files',         popular: true },
    { id: 'notion',     name: 'Notion',      desc: 'Pages, databases, workspaces' },
    { id: 'jira',       name: 'Jira',        desc: 'Tickets, comments, attachments' },
    { id: 'salesforce', name: 'Salesforce',  desc: 'Knowledge articles & cases' },
    { id: 'gitlab',     name: 'GitLab',      desc: 'Repos, wikis, issues' },
    { id: 'web',        name: 'Web crawler', desc: 'Public or authenticated URLs' },
    { id: 'sql',        name: 'SQL',         desc: 'Postgres / MySQL / Snowflake tables' },
    { id: 'box',        name: 'Box',         desc: 'Folders, collaborations' },
    { id: 'zendesk',    name: 'Zendesk',     desc: 'Help center articles & tickets' },
  ];

  Object.assign(window, { INDEXES, INDEX_DOCS, HAYSTACK_YAML, CONNECTOR_LIST });
})();
