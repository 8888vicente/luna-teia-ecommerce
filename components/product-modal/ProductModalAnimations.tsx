export default function ProductModalAnimations() {
  return (
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes modalSlideUp {
        0% { opacity: 0; transform: translateY(100px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes fsIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}} />
  );
}
