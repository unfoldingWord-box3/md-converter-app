import React, { useState, useRef, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import Fab from '@material-ui/core/Fab';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';

const ScrollingWrapperContainer = styled.div`
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  height: 100%;
  position: relative;
`

const ScrollToBottomIconContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 0%;
  margin: 0px 15px;
  margin-left: -50px;
  z-index: 2;
  cursor: pointer;
  opacity: 0.5;
  text-align: center;

  &:hover {
    opacity: 1;
    animation: wiggle 1s ease;
    animation-iteration-count: 1;
  }

  @keyframes wiggle {
    20% { transform: translateY(6px); }
    40% { transform: translateY(-6px); }
    60% { transform: translateY(4px); }
    80% { transform: translateY(-2px); }
    100% { transform: translateY(0); }
  }
`

const ScrollToTopIconContainer = styled.div`
  position: fixed;
  bottom: 70px;
  right: 0%;
  margin: 0px 15px;
  margin-left: -50px;
  z-index: 2;
  cursor: pointer;
  opacity: 0.5;
  text-align: center;

  &:hover {
    opacity: 1;
    animation: wiggle 1s ease;
    animation-iteration-count: 1;
  }

  @keyframes wiggle {
    20% { transform: translateY(6px); }
    40% { transform: translateY(-6px); }
    60% { transform: translateY(4px); }
    80% { transform: translateY(-2px); }
    100% { transform: translateY(0); }
  }
`

const ScrollingWrapper = (props) => {
  const [hasScrolled, setScroll] = useState(false);
  const ref = useRef();

  const handler = useCallback(() => {
    if (window.pageYOffset > (window.innerHeight / 2)) {
      setScroll(true)
    } else {
      setScroll(false)
    }
  }, [setScroll]);

  useEventListener('scroll', handler);

  const scrollToTop = () => {
    try {
      // trying to use new API - https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      // just a fallback for older browsers
      window.scrollTo(0, 0);
    }
  }

  const scrollToBottom = () => {
    try {
      window.scroll({
        top: document.body.scrollHeight,
        left: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      // just a fallback for older browsers
      window.scrollTo(0, document.body.scrollHeight);
    }
  }

  return (
    <React.Fragment>
      {hasScrolled && (
        <ScrollToTopIconContainer onClick={scrollToTop}>
          <Fab color="primary" size="small" aria-label="scroll back to top" title="Scroll back to top">
            <KeyboardArrowUpIcon />
          </Fab>
        </ScrollToTopIconContainer>
      )}
      <ScrollToBottomIconContainer onClick={scrollToBottom}>
        <Fab color="primary" size="small" aria-label="scroll back to top">
          <KeyboardArrowDown />
        </Fab>
      </ScrollToBottomIconContainer>
      <ScrollingWrapperContainer ref={ref}>
        {props.children}
      </ScrollingWrapperContainer>
    </React.Fragment>
  )
}

function useEventListener(eventName, handler, element = window){
  // Create a ref that stores handler
  const savedHandler = useRef();

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;

      // Create event listener that calls handler function stored in ref
      const eventListener = event => savedHandler.current(event);

      // Add event listener
      element.addEventListener(eventName, eventListener);

      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
};

export default ScrollingWrapper
