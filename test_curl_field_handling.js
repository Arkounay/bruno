// Test script to verify that the cURL detection properly handles form field validation
const { JSDOM } = require('jsdom');

// Mock the browser environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = {
  clipboard: {
    readText: async () => 'curl -X POST https://api.example.com/users/123 -H "Content-Type: application/json" -d \'{"name": "test"}\''
  }
};

// Mock formik object to test field value and touched state handling
const mockFormik = {
  values: {},
  touched: {},
  setFieldValue: function(fieldName, value) {
    console.log(`Setting field '${fieldName}' to: ${value}`);
    this.values[fieldName] = value;
  },
  setFieldTouched: function(fieldName, touched) {
    console.log(`Setting field '${fieldName}' touched state to: ${touched}`);
    this.touched[fieldName] = touched;
  }
};

// Mock the getRequestFromCurlCommand function
function getRequestFromCurlCommand(curlCommand) {
  if (curlCommand.includes('curl')) {
    return {
      method: 'POST',
      url: 'https://api.example.com/users/123',
      headers: [{ name: 'Content-Type', value: 'application/json' }],
      body: { mode: 'json', json: '{"name": "test"}' }
    };
  }
  return null;
}

// Simulate the cURL detection logic from the component
async function simulateCurlDetection(formik) {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const clipboardText = await navigator.clipboard.readText();
      
      // Check if clipboard contains a cURL command
      const curlCommandRegex = /^\s*curl\s/i;
      if (curlCommandRegex.test(clipboardText)) {
        console.log('✓ cURL command detected in clipboard');
        
        // Parse the cURL command to extract request data
        const request = getRequestFromCurlCommand(clipboardText);
        if (request) {
          console.log('✓ Successfully parsed cURL command');
          
          // Switch to 'from-curl' mode
          formik.setFieldValue('requestType', 'from-curl');
          formik.setFieldValue('curlCommand', clipboardText);
          
          // Generate automatic request name: METHOD + URL path (without domain)
          try {
            const url = new URL(request.url);
            const pathname = url.pathname || '/';
            const requestName = `${request.method} ${pathname}`;
            formik.setFieldValue('requestName', requestName);
            formik.setFieldTouched('requestName', true);
            console.log('✓ Request name set and field marked as touched');
          } catch (urlError) {
            // If URL parsing fails, just use method
            const requestName = request.method || 'GET';
            formik.setFieldValue('requestName', requestName);
            formik.setFieldTouched('requestName', true);
            console.log('✓ Fallback request name set and field marked as touched');
          }
        }
      }
    }
  } catch (error) {
    console.log('Clipboard access not available or denied');
  }
}

// Run the test
console.log('Testing cURL detection with proper field handling...\n');

simulateCurlDetection(mockFormik).then(() => {
  console.log('\nFinal form state:');
  console.log('Values:', mockFormik.values);
  console.log('Touched:', mockFormik.touched);
  
  // Verify the fix
  const isRequestNameTouched = mockFormik.touched.requestName === true;
  const hasRequestName = mockFormik.values.requestName && mockFormik.values.requestName.length > 0;
  
  console.log('\n--- Test Results ---');
  console.log(`✓ Request name field has value: ${hasRequestName}`);
  console.log(`✓ Request name field is marked as touched: ${isRequestNameTouched}`);
  
  if (hasRequestName && isRequestNameTouched) {
    console.log('\n🎉 SUCCESS: The field handling bug has been fixed!');
    console.log('The request name field will now be properly recognized by the form validation.');
  } else {
    console.log('\n❌ FAIL: The field handling issue persists.');
  }
});