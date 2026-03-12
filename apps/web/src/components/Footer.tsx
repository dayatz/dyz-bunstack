export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t px-4 py-6 text-center text-sm text-muted-foreground">
      <p>&copy; {year} dyz-bunstack. All rights reserved.</p>
    </footer>
  );
}
