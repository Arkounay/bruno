import styled from 'styled-components';

const Wrapper = styled.div`
  table {
    width: 100%;
    border-collapse: collapse;

    thead {
      color: #777777;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    td {
      padding: 6px 10px;

      &.value {
        word-break: break-all;

        .copy-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: ${(props) => props.theme.text};
          opacity: 0.6;
          transition: opacity 0.2s;
          vertical-align: middle;

          &:hover {
            opacity: 1;
          }

          &:active {
            opacity: 0.8;
          }
        }
      }
    }

    tbody {
      tr:nth-child(odd) {
        background-color: ${(props) => props.theme.table.striped};
      }
    }
  }
`;

export default Wrapper;
