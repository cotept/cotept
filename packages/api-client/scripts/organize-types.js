#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TYPES_DIR = path.join(__dirname, '../src/types');
const SERVICES_DIR = path.join(__dirname, '../src/services');

// Error handling utility
function handleError(message, error) {
  console.error(`❌ ${message}:`, error.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }
}

// Safe file system operations
function safeReadDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Directory not found: ${dirPath}`);
      return [];
    }
    return fs.readdirSync(dirPath);
  } catch (error) {
    handleError(`Failed to read directory ${dirPath}`, error);
    return [];
  }
}

function safeReadFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    handleError(`Failed to read file ${filePath}`, error);
    return null;
  }
}

function safeMoveFile(sourcePath, targetPath) {
  try {
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    if (!fs.existsSync(targetPath)) {
      fs.renameSync(sourcePath, targetPath);
      return true;
    }
    return false;
  } catch (error) {
    handleError(`Failed to move file from ${sourcePath} to ${targetPath}`, error);
    return false;
  }
}

/**
 * Services 파일들을 분석해서 도메인별 타입 매핑을 동적으로 생성
 */
function extractDomainMappingsFromServices() {
  console.log('🔍 Analyzing services folder for dynamic domain mapping...');
  
  const domainMappings = {};
  
  // services 폴더의 모든 파일 스캔
  const serviceFiles = safeReadDir(SERVICES_DIR)
    .filter(file => file.endsWith('-api.ts'));
  
  if (serviceFiles.length === 0) {
    console.log('⚠️  No service files found');
    return domainMappings;
  }
  
  serviceFiles.forEach(serviceFile => {
    // 파일명에서 도메인 추출 (예: user-api.ts → user)
    const domain = serviceFile.replace('-api.ts', '');
    const servicePath = path.join(SERVICES_DIR, serviceFile);
    
    const content = safeReadFile(servicePath);
    if (!content) return;
    
    // import type { ... } from '../types' 패턴 매칭 (더 유연한 패턴)
    const importMatches = content.match(/import\s+type\s*\{\s*([^}]+)\s*\}\s*from\s*['"]\.\.[\/\\]types['"];?/g);
    
    if (importMatches) {
      const types = [];
      
      importMatches.forEach(importLine => {
        // 중괄고 안의 타입들 추출
        const typeMatch = importLine.match(/\{\s*([^}]+)\s*\}/);
        if (typeMatch) {
          const typeNames = typeMatch[1]
            .split(',')
            .map(type => type.trim())
            .filter(type => type.length > 0);
          
          types.push(...typeNames);
        }
      });
      
      if (types.length > 0) {
        domainMappings[domain] = [...new Set(types)]; // 중복 제거
        console.log(`📋 ${domain}: ${types.length} types found`);
      }
    } else {
      console.log(`⚠️  No type imports found in ${serviceFile}`);
    }
  });
  
  return domainMappings;
}

/**
 * 타입 파일명을 PascalCase로 변환 (TypeScript 타입명 → 파일명)
 */
function typeNameToFileName(typeName) {
  // PascalCase 그대로 유지 (첫 글자만 대문자 확인)
  return typeName.charAt(0).toUpperCase() + typeName.slice(1);
}

/**
 * 도메인 매핑을 기반으로 타입 파일들을 분류
 */
function classifyTypesByDomain(domainMappings) {
  const typeToFile = {};
  const fileToDomain = {};
  
  // 각 도메인의 타입들을 파일명으로 변환
  Object.entries(domainMappings).forEach(([domain, types]) => {
    types.forEach(typeName => {
      const fileName = typeNameToFileName(typeName);
      typeToFile[typeName] = fileName;
      fileToDomain[fileName] = domain;
    });
  });
  
  return { typeToFile, fileToDomain };
}

/**
 * 파일명에서 도메인 키워드를 추출하여 분류
 */
function getDomainForFile(filename, fileToDomain) {
  const baseName = path.basename(filename, '.ts').toLowerCase();
  
  // 직접 매핑이 있는 경우 (services에서 추출한 정확한 매핑)
  const exactMatch = Object.entries(fileToDomain).find(([pattern, domain]) => {
    return baseName === pattern.toLowerCase();
  });
  if (exactMatch) {
    return exactMatch[1];
  }
  
  // 도메인 키워드 기반 분류 (services 폴더 구조와 연동)
  const domainKeywords = {
    'user': ['user', 'password-change', 'change-password'],
    'auth': ['login', 'logout', 'token', 'auth', 'verify', 'exchange', 'confirm', 'find-id', 'reset-password', 'verification-code'],
    'mail': ['mail', 'email-verification', 'password-recovery', 'reservation'],
    'mail-audit': ['mail-audit'],
    'github-auth': ['github'],
    'google-auth': ['google'],
    'baekjoon': ['baekjoon', 'profile', 'statistics']
  };
  
  // 키워드 매칭으로 도메인 찾기
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    for (const keyword of keywords) {
      if (baseName.includes(keyword)) {
        return domain;
      }
    }
  }
  
  // 에러 응답 파일의 경우, 에러가 아닌 부분으로 도메인 추정
  if (baseName.includes('response') && /\d{3}-response/.test(baseName)) {
    const operationPart = baseName.replace(/-\d{3}-response$/, '');
    
    // 재귀적으로 operation 부분으로 도메인 찾기
    const operationDomain = getDomainForFile(operationPart + '.ts', fileToDomain);
    if (operationDomain) {
      return operationDomain;
    }
  }
  
  // 공통 타입들
  if (baseName.includes('empty-') || baseName.includes('wrapper')) {
    return 'common';
  }
  
  return null;
}

function organizeTypes() {
  console.log('🚀 Starting dynamic type organization...');
  
  // 1. Services 분석으로 도메인 매핑 추출
  const domainMappings = extractDomainMappingsFromServices();
  
  if (Object.keys(domainMappings).length === 0) {
    console.log('⚠️  No domain mappings found from services');
    return;
  }
  
  // 2. 타입명 → 파일명 매핑 생성
  const { fileToDomain } = classifyTypesByDomain(domainMappings);
  
  console.log('🗂️  Domain mappings:', Object.keys(domainMappings).join(', '));
  
  // 3. 도메인 폴더들 생성
  Object.keys(domainMappings).forEach(domain => {
    const domainDir = path.join(TYPES_DIR, domain);
    if (!fs.existsSync(domainDir)) {
      fs.mkdirSync(domainDir, { recursive: true });
    }
  });
  
  // common 폴더도 생성
  const commonDir = path.join(TYPES_DIR, 'common');
  if (!fs.existsSync(commonDir)) {
    fs.mkdirSync(commonDir, { recursive: true });
  }

  // 4. 루트 레벨의 타입 파일들 읽기
  const files = safeReadDir(TYPES_DIR)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts')
    .filter(file => {
      try {
        return !fs.statSync(path.join(TYPES_DIR, file)).isDirectory();
      } catch (error) {
        handleError(`Failed to check if ${file} is directory`, error);
        return false;
      }
    });

  let movedCount = 0;
  let unmappedFiles = [];

  // 5. 파일들을 도메인별로 이동 (EmptyWrapper는 제외)
  files.forEach(file => {
    // EmptyWrapper는 나중에 처리
    if (file === 'empty-wrapper.ts') {
      return;
    }
    
    const domain = getDomainForFile(file, fileToDomain);
    
    if (domain) {
      const sourcePath = path.join(TYPES_DIR, file);
      const targetPath = path.join(TYPES_DIR, domain, file);
      
      if (safeMoveFile(sourcePath, targetPath)) {
        console.log(`📁 ${file} → ${domain}/`);
        movedCount++;
      }
    } else {
      unmappedFiles.push(file);
    }
  });

  // 6. EmptyWrapper를 common에만 유지
  const emptyWrapperSourcePath = path.join(TYPES_DIR, 'empty-wrapper.ts');
  const emptyWrapperCommonPath = path.join(commonDir, 'empty-wrapper.ts');
  
  // EmptyWrapper를 common 폴더로 이동
  if (safeMoveFile(emptyWrapperSourcePath, emptyWrapperCommonPath)) {
    console.log(`📁 empty-wrapper.ts → common/`);
    movedCount++;
  }

  // 7. 도메인별 index.ts 파일 생성
  const allDomains = [...Object.keys(domainMappings), 'common'];
  allDomains.forEach(domain => {
    const domainDir = path.join(TYPES_DIR, domain);
    const indexPath = path.join(domainDir, 'index.ts');
    
    if (fs.existsSync(domainDir)) {
      const domainFiles = fs.readdirSync(domainDir)
        .filter(file => file.endsWith('.ts') && file !== 'index.ts')
        .sort();

      if (domainFiles.length > 0) {
        const exports = domainFiles
          .map(file => `export * from './${path.basename(file, '.ts')}';`)
          .join('\n');
        
        const content = `// ${domain.charAt(0).toUpperCase() + domain.slice(1)} Domain Types\n${exports}\n`;
        fs.writeFileSync(indexPath, content);
        console.log(`📝 Updated ${domain}/index.ts (${domainFiles.length} types)`);
      }
    }
  });

  // 8. 메인 index.ts 파일 업데이트
  const mainIndexPath = path.join(TYPES_DIR, 'index.ts');
  const existingDomains = allDomains.filter(domain => {
    const domainDir = path.join(TYPES_DIR, domain);
    return fs.existsSync(domainDir) && fs.readdirSync(domainDir).some(file => file.endsWith('.ts') && file !== 'index.ts');
  });
  
  const domainExports = existingDomains
    .map(domain => `// ${domain.charAt(0).toUpperCase() + domain.slice(1)} Domain\nexport * from './${domain}';`)
    .join('\n\n');
  
  const mainIndexContent = `// Domain-based Type Exports\n\n${domainExports}\n`;
  fs.writeFileSync(mainIndexPath, mainIndexContent);
  console.log('📝 Updated main index.ts');

  console.log(`✅ Organized ${movedCount} files into domain folders`);
  
  if (unmappedFiles.length > 0) {
    console.log(`⚠️  Unmapped files (${unmappedFiles.length}):`, unmappedFiles.join(', '));
  }
}

// 스크립트 실행
try {
  organizeTypes();
  console.log('🎉 Dynamic type organization completed!');
} catch (error) {
  console.error('❌ Error organizing types:', error);
  process.exit(1);
}