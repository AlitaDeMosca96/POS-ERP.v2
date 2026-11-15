import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Reglas nuevas de React 19 que no bloquean el build de producción
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      
      // Permitimos 'any' pero avisamos para ir limpiando de a poco
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Evitar warnings por variables no usadas que son intencionales
      '@typescript-eslint/no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_' 
      }],
    }
  }
]);

export default eslintConfig;