import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPartyPrompts } from "@/lib/data";
import { RemoteRoomRunner } from "@/components/RemoteRoomRunner";
import { JoinRoomForm } from "@/components/JoinRoomForm";

export default async function SalonPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, code, depth, status, host_user_id, current_player_id")
    .eq("code", code)
    .maybeSingle();
  if (!room) notFound();

  const { data: myPlayer } = await supabase
    .from("players")
    .select("id")
    .eq("room_id", room.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!myPlayer) {
    return (
      <div>
        <div className="hero">
          <h1 style={{ fontSize: 28 }}>Rejoindre le salon {room.code}</h1>
          <p>Indique ton prénom pour entrer dans la partie.</p>
        </div>
        <JoinRoomForm defaultCode={room.code} />
      </div>
    );
  }

  const [{ data: players }, { data: turns }, { data: customPrompts }, catalog] = await Promise.all([
    supabase
      .from("players")
      .select("id, user_id, name, skips_left, joined_at")
      .eq("room_id", room.id),
    supabase
      .from("turns")
      .select("id, player_id, turn_type, depth, prompt, response_text, proof_path, status, created_at")
      .eq("room_id", room.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("room_custom_prompts")
      .select("id, type, depth, text")
      .eq("room_id", room.id),
    getPartyPrompts(),
  ]);

  return (
    <RemoteRoomRunner
      room={room}
      players={players ?? []}
      turns={turns ?? []}
      customPrompts={customPrompts ?? []}
      catalog={catalog}
      myUserId={user.id}
    />
  );
}
