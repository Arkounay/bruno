import React from 'react';
import StyledWrapper from './StyledWrapper';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { IconCopy } from '@tabler/icons';

const ResponseHeaders = ({ headers }) => {
  const headersArray = typeof headers === 'object' ? Object.entries(headers) : [];

  const isDebugRouteHeader = (headerName) => {
    return headerName.toLowerCase() === 'x-debug-route';
  };

  return (
    <StyledWrapper className="pb-4 w-full">
      <table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Value</td>
          </tr>
        </thead>
        <tbody>
          {headersArray && headersArray.length
            ? headersArray.map((header, index) => {
                const [headerName, headerValue] = header;
                return (
                  <tr key={index}>
                    <td className="key">{headerName}</td>
                    <td className="value">
                      {headerValue}
                      {isDebugRouteHeader(headerName) && (
                        <CopyToClipboard
                          text={headerValue}
                          onCopy={() => toast.success(`${headerValue} copied`)}
                        >
                          <button
                            className="copy-button ml-2"
                            title="Copy to clipboard"
                          >
                            <IconCopy size={16} strokeWidth={1.5} />
                          </button>
                        </CopyToClipboard>
                      )}
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>
    </StyledWrapper>
  );
};
export default ResponseHeaders;
