import styled from 'styled-components';

const Loader = ({ message = "Yuklanmoqda...", current = 0, total = 0 }) => {
  const showProgress = Number(total) > 0;
  const percent = showProgress
    ? Math.min(100, Math.round((Number(current || 0) / Number(total)) * 100))
    : 0;

  return (
    <StyledWrapper>
      <div className="full">
        <div className="loader-panel" data-i18n-skip="true">
          <div className="spinner">
            <div className="spinner-blade" />
            <div className="spinner-blade" />
            <div className="spinner-blade" />
            <div className="spinner-blade" />
            <div className="spinner-blade" />
            <div className="spinner-blade" />
            <div className="spinner-blade" />
            <div className="spinner-blade" />
            <div className="spinner-blade" />
            <div className="spinner-blade" />
            <div className="spinner-blade" />
            <div className="spinner-blade" />
          </div>
          <div className="loader-message">{message}</div>
          {showProgress && (
            <>
              <div className="loader-progress">
                <div style={{ width: `${percent}%` }} />
              </div>
              <div className="loader-count">{current}/{total}</div>
            </>
          )}
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .full{
    width:100%;
    height:100vh;
    position:fixed;
    top:0;
    left:0;
    background-color: rgba(255, 255, 255, 0.78);
    z-index:10000;
    display:flex;
    align-items:center;
    justify-content:center;
    backdrop-filter: blur(3px);
  }

  .loader-panel {
    min-width: 220px;
    max-width: calc(100vw - 48px);
    min-height: 148px;
    padding: 26px 24px 22px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap: 18px;
  }

  .spinner {
    font-size: 28px;
    position: relative;
    display: inline-block;
    width: 1em;
    height: 1em;
  }

  .loader-message {
    color: #1a2b4a;
    font-size: 15px;
    font-weight: 700;
    text-align: center;
    line-height: 1.35;
  }

  .loader-progress {
    width: 100%;
    height: 7px;
    border-radius: 999px;
    overflow: hidden;
    background: #e5edf4;
  }

  .loader-progress > div {
    height: 100%;
    border-radius: inherit;
    background: #006CAC;
    transition: width 0.2s ease;
  }

  .loader-count {
    color: #5b6b7d;
    font-size: 12px;
    font-weight: 700;
  }

  .spinner .spinner-blade {
    position: absolute;
    left: 0.4629em;
    bottom: 0;
    width: 0.074em;
    height: 0.2777em;
    border-radius: 0.0555em;
    background-color: transparent;
    -webkit-transform-origin: center -0.2222em;
    -ms-transform-origin: center -0.2222em;
    transform-origin: center -0.2222em;
    animation: spinner-fade9234 1s infinite linear;
  }

  .spinner .spinner-blade:nth-child(1) {
    -webkit-animation-delay: 0s;
    animation-delay: 0s;
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  .spinner .spinner-blade:nth-child(2) {
    -webkit-animation-delay: 0.083s;
    animation-delay: 0.083s;
    -webkit-transform: rotate(30deg);
    -ms-transform: rotate(30deg);
    transform: rotate(30deg);
  }

  .spinner .spinner-blade:nth-child(3) {
    -webkit-animation-delay: 0.166s;
    animation-delay: 0.166s;
    -webkit-transform: rotate(60deg);
    -ms-transform: rotate(60deg);
    transform: rotate(60deg);
  }

  .spinner .spinner-blade:nth-child(4) {
    -webkit-animation-delay: 0.249s;
    animation-delay: 0.249s;
    -webkit-transform: rotate(90deg);
    -ms-transform: rotate(90deg);
    transform: rotate(90deg);
  }

  .spinner .spinner-blade:nth-child(5) {
    -webkit-animation-delay: 0.332s;
    animation-delay: 0.332s;
    -webkit-transform: rotate(120deg);
    -ms-transform: rotate(120deg);
    transform: rotate(120deg);
  }

  .spinner .spinner-blade:nth-child(6) {
    -webkit-animation-delay: 0.415s;
    animation-delay: 0.415s;
    -webkit-transform: rotate(150deg);
    -ms-transform: rotate(150deg);
    transform: rotate(150deg);
  }

  .spinner .spinner-blade:nth-child(7) {
    -webkit-animation-delay: 0.498s;
    animation-delay: 0.498s;
    -webkit-transform: rotate(180deg);
    -ms-transform: rotate(180deg);
    transform: rotate(180deg);
  }

  .spinner .spinner-blade:nth-child(8) {
    -webkit-animation-delay: 0.581s;
    animation-delay: 0.581s;
    -webkit-transform: rotate(210deg);
    -ms-transform: rotate(210deg);
    transform: rotate(210deg);
  }

  .spinner .spinner-blade:nth-child(9) {
    -webkit-animation-delay: 0.664s;
    animation-delay: 0.664s;
    -webkit-transform: rotate(240deg);
    -ms-transform: rotate(240deg);
    transform: rotate(240deg);
  }

  .spinner .spinner-blade:nth-child(10) {
    -webkit-animation-delay: 0.747s;
    animation-delay: 0.747s;
    -webkit-transform: rotate(270deg);
    -ms-transform: rotate(270deg);
    transform: rotate(270deg);
  }

  .spinner .spinner-blade:nth-child(11) {
    -webkit-animation-delay: 0.83s;
    animation-delay: 0.83s;
    -webkit-transform: rotate(300deg);
    -ms-transform: rotate(300deg);
    transform: rotate(300deg);
  }

  .spinner .spinner-blade:nth-child(12) {
    -webkit-animation-delay: 0.913s;
    animation-delay: 0.913s;
    -webkit-transform: rotate(330deg);
    -ms-transform: rotate(330deg);
    transform: rotate(330deg);
  }

  @keyframes spinner-fade9234 {
    0% {
      background-color: #69717d;
    }

    100% {
      background-color: transparent;
    }
  }`;

export default Loader;
