import bpy
import bmesh
import math
import os

OUT_DIR = os.path.dirname(os.path.abspath(__file__))


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block_collection in (bpy.data.meshes, bpy.data.materials):
        for block in list(block_collection):
            block_collection.remove(block)


def make_material(name, base_color, metallic, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def export_glb(obj, filepath):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        use_selection=True,
        export_format="GLB",
        export_apply=True,
        export_normals=True,
        export_texcoords=False,
        export_materials="EXPORT",
        export_yup=True,
    )
    print("wrote", filepath, os.path.getsize(filepath), "bytes")


# ---------------- JETON DE CASINO (cylindre + biseau + insert dore) ----------------
def model_chip():
    clear_scene()

    body_mat = make_material("ChipBody", (0.44, 0.055, 0.085), metallic=0.05, roughness=0.55)
    gold_mat = make_material("ChipGold", (0.83, 0.69, 0.22), metallic=1.0, roughness=0.2)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=0.12, vertices=48)
    body = bpy.context.active_object
    body.name = "ChipBody"

    bevel = body.modifiers.new("EdgeBevel", "BEVEL")
    bevel.width = 0.02
    bevel.segments = 5
    bevel.limit_method = "ANGLE"
    bpy.ops.object.modifier_apply(modifier=bevel.name)

    body.data.materials.append(body_mat)

    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.44, minor_radius=0.045, major_segments=48, minor_segments=14
    )
    rim = bpy.context.active_object
    rim.name = "ChipGoldRim"
    rim.data.materials.append(gold_mat)

    bpy.ops.object.select_all(action="DESELECT")
    rim.select_set(True)
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()

    bpy.ops.object.shade_auto_smooth(angle=math.radians(45))

    export_glb(body, os.path.join(OUT_DIR, "chip.glb"))


# ---------------- MOYEU DE ROULETTE (profil tourne / spin, comme un tour a bois) ----------------
def model_wheel_hub():
    clear_scene()

    gold_mat = make_material("HubGold", (0.83, 0.69, 0.22), metallic=1.0, roughness=0.16)

    mesh = bpy.data.meshes.new("WheelHub")
    obj = bpy.data.objects.new("WheelHub", mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj

    bm = bmesh.new()

    # profil (rayon, hauteur) du bas vers le haut : base evasee, col, dome
    profile = [
        (0.46, 0.00),
        (0.46, 0.05),
        (0.30, 0.09),
        (0.22, 0.14),
        (0.22, 0.30),
        (0.32, 0.34),
        (0.18, 0.46),
        (0.00, 0.52),
    ]
    verts = [bm.verts.new((r, 0.0, z)) for (r, z) in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]

    spin_result = bmesh.ops.spin(
        bm,
        geom=verts + edges,
        angle=math.radians(360),
        steps=40,
        axis=(0, 0, 1),
        cent=(0, 0, 0),
    )

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0001)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()

    mesh.materials.append(gold_mat)
    obj.rotation_euler = (0, 0, 0)

    bpy.ops.object.shade_auto_smooth(angle=math.radians(50))

    export_glb(obj, os.path.join(OUT_DIR, "wheel_hub.glb"))


model_chip()
model_wheel_hub()
print("DONE")
