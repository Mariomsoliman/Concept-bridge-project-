#!/usr/bin/env node

// Quick test: Fetch enriched content and display it
import fetch from 'node-fetch';

async function testEnrichment() {
  try {
    console.log('🧪 Testing enriched topic endpoint...\n');
    
    const url = 'http://localhost:3000/api/topic/dna-replication';
    console.log(`📡 Fetching: ${url}\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('✅ Response received:\n');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.enrichment && data.enrichment.detailedExplanation) {
      console.log('\n📚 DETAILED EXPLANATION PREVIEW:');
      console.log('─'.repeat(60));
      console.log(data.enrichment.detailedExplanation.substring(0, 300) + '...');
      console.log('─'.repeat(60));
    }
    
    if (data.enrichment && data.enrichment.stepByStepGuide) {
      console.log('\n📖 STEP-BY-STEP GUIDE:');
      data.enrichment.stepByStepGuide.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step.substring(0, 80)}...`);
      });
    }
    
    if (data.enrichment && data.enrichment.keyTakeaways) {
      console.log('\n⭐ KEY TAKEAWAYS:');
      data.enrichment.keyTakeaways.forEach(t => console.log(`  • ${t}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testEnrichment();
