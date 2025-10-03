import styled from 'styled-components';

const Wrapper = styled.div`
  .text-muted {
    color: ${(props) => props.theme.text.muted};
  }

  ul {
    li {
      color: ${(props) => props.theme.text.default};
    }
  }

  .max-h-64 {
    max-height: 16rem;
  }

  .overflow-y-auto {
    overflow-y: auto;
  }
`;

export default Wrapper;
