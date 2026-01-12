# @kasparsz/position-tracker

A high-performance, reactive element position and size tracker for the web, powered by [alien-signals](https://github.com/stackblitz/alien-signals).

## Features

- 🚀 **High Performance**: Optimized frame loop to batch read/write DOM operations and minimize layout thrashing and unnecessary computations.
- ⚡ **Reactive**: Seamlessly integrates with `alien-signals` for efficient state management and updates.
- 📏 **Relative Tracking**: Track elements relative to other elements, the window, or custom virtual trackers.
- 🧩 **Virtual Trackers**: Define custom tracking points or regions not directly tied to a DOM element.
- 🛠️ **Lightweight**: Minimal dependencies and small bundle size.
- 📐 **Sub-pixel Accuracy**: Rounded values to avoid floating-point errors in transforms.

## Installation

```bash
npm install @kasparsz/position-tracker
```

## Quick Start

```typescript
import { track } from '@kasparsz/position-tracker';

const element = document.querySelector('.my-element');
const tracker = track(element);

// Listen for changes
function onChange (tracker) {
  console.log('Position:', tracker.relativePosition.toJSON()); // => { left: 0, top: 0, right: 0, bottom: 0 }
  console.log('Left:', tracker.relativePosition.left()); // => 0
  console.log('Top:', tracker.relativePosition.top()); // => 0
  console.log('Right:', tracker.relativePosition.right()); // => 0
  console.log('Bottom:', tracker.relativePosition.bottom()); // => 0

  console.log('Size:', tracker.size.toJSON()); // => { width: 0, height: 0 }
  console.log('Width:', tracker.size.width()); // => 0
  console.log('Height:', tracker.size.height()); // => 0
  
  console.log('Visible:', tracker.visible()); // => true or false
}

const removeListener = tracker.on(onChange);

// To stop tracking
// removeListener();

// or
// tracker.off(onChange);
```

## Usage

### Relative Tracking

Track an element relative to another element:

```typescript
const element = document.querySelector('.child');
const parent = document.querySelector('.parent');

const tracker = track(element, parent);

tracker.on((t) => {
  // Coordinates are now relative to the parent element
  console.log('Relative Position:', t.relativePosition.left());
});
```

### Using Signals

Integration with `alien-signals` allows for powerful reactive patterns:

```typescript
import { track, effect } from '@kasparsz/position-tracker';

const tracker = track(document.querySelector('.box'));

// Listen for changes
effect(() => {
  console.log('Position changed:', tracker.relativePosition.left(), tracker.relativePosition.top());
});
effect(() => {
  console.log('Size changed:', tracker.size.width(), tracker.size.height());
});
effect(() => {
  console.log('Visible changed:', tracker.visible());
});
```

### Virtual Trackers

You can track elements relative to arbitrary coordinates using virtual trackers:

```typescript
const virtualTracker = {
  position: {
    left: 100,
    top: 100,
    right: 200,
    bottom: 200,
  }
};

const tracker = track(element, virtualTracker);
```

You can even use signals for virtual tracker positions:

```typescript
import { signal } from 'alien-signals';

const virtualTracker = {
  position: {
    left: signal(100),
    top: signal(100),
    right: signal(200),
    bottom: signal(200),
  }
};
```

### Controlling the Tracker

```typescript
tracker.pause();   // Stop emitting changes and remove from loop
tracker.resume();  // Resume tracking
```

## API Reference

### `track(element, relativeTo?)`

- `element`: `HTMLElement | Element | Document` - The element to track.
- `relativeTo`: (Optional) `HTMLElement | Element | Document | Window | VirtualTracker` - The reference for relative coordinates.

Returns a `Tracker` instance.

### `Tracker` Class

#### Properties
- `position`: `TrackerPositionSignal` - Global position relative to the viewport.
- `size`: `TrackerSizeSignal` - Element dimensions.
- `relativePosition`: `TrackerPositionSignal` - Position relative to the `relativeTo` target.
- `visible`: `SignalType<boolean>` - Element visibility.

#### Methods
- `on(callback, options?)`: Add a change listener. Returns an unsubscribe function.
- `off(callback)`: Remove a change listener.
- `pause()`: Pause tracking.
- `resume()`: Resume tracking.
- `update()`: Force a manual update (usually handled by the frame loop).


## Frame loop

The frame loop is a loop that runs on each frame and is optimized to prevent layout thrashing and unnecessary computations.  
It's integral part of the position tracking, but it can be used separately too.

On each frame it executes following steps:

1. `setup(fn, [once])` - intended to perform any setup operations
2. `read(fn, [once])` - intended to read the DOM or other state
3. `update(fn, [once])` - intended to update the state
4. `render(fn, [once])` - intended to render the state to the DOM

```typescript
import { frame } from '@kasparsz/position-tracker';

frame.setup(() => {
  console.log('Frame loop setup');
});

frame.read(() => {
  console.log('Frame loop read');
});

frame.update(() => {
  console.log('Frame loop update');
});

frame.render(() => {
  console.log('Frame loop render');
});
```

Scheduling one of the next steps (or current step) will execute it in the same tick, but scheduling preceding steps will execute them in the next tick.

```typescript
import { frame } from '@kasparsz/position-tracker';

frame.update(() => {
  console.log('Frame loop update');

  // Same tick
  frame.update(() => {
  });

  // Next tick
  frame.read(() => {
    console.log('Frame loop read');
  }, true);
});
```

```typescript
import { frame } from '@kasparsz/position-tracker';

frame.update(() => {
  console.log('Frame loop update');

  // Next tick
  frame.read(() => {
    console.log('Frame loop read');
  }, true);
});
```


### Execute only once

```typescript
import { frame } from '@kasparsz/position-tracker';

frame.render(() => {
  console.log('This will be executed only once');
}, true);
```

### Cancel execution

```typescript
import { frame } from '@kasparsz/position-tracker';

const cancel = frame.render(() => {
  console.log('This will be executed only once');
}, true);

// Cancel execution
cancel();
```

## @TODO

- Tests
- Example website

## License

MIT
