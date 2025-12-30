import ColorToday from "../components/ColorToday";

export default function Home() {
  return (
    <main>
      <header>
        <h1>color today</h1>
        <p className="subtitle">
          A daily abstract coloring ritual. Tap a shape, pick a hue, and build
          your own version of today&apos;s art. Your progress is saved on this
          device.
        </p>
      </header>
      <ColorToday />
      <footer>New canvas drops every day at midnight in your local time.</footer>
    </main>
  );
}
