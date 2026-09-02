import { CreateQuizForm } from "@/components/CreateQuizForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 pb-16 pt-4">
      <section className="flex flex-col gap-3 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Apprends à connaître tes proches, un test à la fois.
        </h1>
        <p className="text-base leading-relaxed text-foreground/70">
          Choisis un thème (ou invente le tien), on génère un test rigolo en
          quelques secondes. Partage le lien, la personne répond sans compte,
          et son portrait de personnalité s&apos;affiche instantanément — pour
          elle comme pour toi.
        </p>
      </section>

      <section className="rounded-3xl border border-border bg-surface/70 p-5 shadow-sm backdrop-blur sm:p-7">
        <CreateQuizForm />
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { emoji: "🔗", text: "Un lien unique à envoyer, sans inscription pour répondre" },
          { emoji: "⚡", text: "Un portrait généré instantanément, jamais un simple score" },
          { emoji: "🔒", text: "Un lien de résultat rien qu'à vous deux, à partager si vous le voulez" },
        ].map((item) => (
          <div
            key={item.text}
            className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-surface/50 p-4"
          >
            <span className="text-xl">{item.emoji}</span>
            <p className="text-sm text-foreground/70">{item.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
