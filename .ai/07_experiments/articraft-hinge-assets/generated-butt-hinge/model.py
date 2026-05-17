from __future__ import annotations

from math import pi

from sdk import (
    ArticulatedObject,
    ArticulationType,
    Box,
    Cylinder,
    MotionLimits,
    Origin,
    TestContext,
    TestReport,
)


def add_countersunk_screw(part, *, x: float, y: float, z: float, material, slot_material, name: str) -> None:
    """Small layered screw marker: round head plus crossed/slot recess bars."""
    part.visual(
        Cylinder(radius=0.030, length=0.010),
        origin=Origin(xyz=(x, y, z), rpy=(0.0, pi / 2.0, 0.0)),
        material=material,
        name=f"{name}_head",
    )
    part.visual(
        Box((0.010, 0.045, 0.004)),
        origin=Origin(xyz=(x + 0.001, y, z)),
        material=slot_material,
        name=f"{name}_slot_a",
    )
    part.visual(
        Box((0.010, 0.004, 0.045)),
        origin=Origin(xyz=(x + 0.002, y, z)),
        material=slot_material,
        name=f"{name}_slot_b",
    )


def build_object_model() -> ArticulatedObject:
    model = ArticulatedObject(name="architectural_butt_hinge")

    leaf_mat = model.material("satin_galvanized_leaf", rgba=(0.68, 0.73, 0.78, 1.0))
    barrel_mat = model.material("darker_pin_and_knuckles", rgba=(0.48, 0.55, 0.62, 1.0))
    screw_mat = model.material("recessed_screw_heads", rgba=(0.56, 0.62, 0.68, 1.0))
    slot_mat = model.material("dark_screw_recesses", rgba=(0.18, 0.23, 0.28, 1.0))

    hinge_height = 1.20
    leaf_width = 0.44
    leaf_thickness = 0.030
    barrel_radius = 0.048
    barrel_x = 0.0
    fixed_leaf_center_y = -leaf_width / 2.0 - barrel_radius - 0.020
    swing_leaf_center_y = leaf_width / 2.0 + barrel_radius + 0.020
    screw_face_x = leaf_thickness / 2.0

    frame_leaf = model.part("frame_leaf")
    door_leaf = model.part("door_leaf")

    # Fixed jamb-side leaf: a rectangular plate connected to alternating barrels.
    frame_leaf.visual(
        Box((leaf_thickness, leaf_width, hinge_height)),
        origin=Origin(xyz=(0.0, fixed_leaf_center_y, 0.0)),
        material=leaf_mat,
        name="frame_rectangular_leaf_plate",
    )

    # Swinging door-side leaf: child part rotates around the pin axis.
    door_leaf.visual(
        Box((leaf_thickness, leaf_width, hinge_height)),
        origin=Origin(xyz=(0.0, swing_leaf_center_y, 0.0)),
        material=leaf_mat,
        name="door_rectangular_leaf_plate",
    )

    # Continuous hinge pin and alternating knuckles. The pin is intentionally visible at
    # the ends; three barrels attach to the frame leaf and two to the swinging leaf.
    frame_leaf.visual(
        Cylinder(radius=0.020, length=hinge_height + 0.105),
        origin=Origin(xyz=(barrel_x, 0.0, 0.0)),
        material=barrel_mat,
        name="continuous_hinge_pin_visible_core",
    )

    fixed_segments = [(0.50, 0.22), (0.00, 0.22), (-0.50, 0.22)]
    swing_segments = [(0.25, 0.20), (-0.25, 0.20)]
    for idx, (z, length) in enumerate(fixed_segments, start=1):
        frame_leaf.visual(
            Cylinder(radius=barrel_radius, length=length),
            origin=Origin(xyz=(barrel_x, 0.0, z)),
            material=barrel_mat,
            name=f"frame_alternating_knuckle_{idx}",
        )
        frame_leaf.visual(
            Box((leaf_thickness * 1.08, 0.075, length * 0.92)),
            origin=Origin(xyz=(0.0, -0.053, z)),
            material=leaf_mat,
            name=f"frame_leaf_to_knuckle_bridge_{idx}",
        )
    for idx, (z, length) in enumerate(swing_segments, start=1):
        door_leaf.visual(
            Cylinder(radius=barrel_radius, length=length),
            origin=Origin(xyz=(barrel_x, 0.0, z)),
            material=barrel_mat,
            name=f"door_alternating_knuckle_{idx}",
        )
        door_leaf.visual(
            Box((leaf_thickness * 1.08, 0.075, length * 0.92)),
            origin=Origin(xyz=(0.0, 0.053, z)),
            material=leaf_mat,
            name=f"door_leaf_to_knuckle_bridge_{idx}",
        )

    # Top and bottom pin caps make the hinge axis unmistakable.
    frame_leaf.visual(
        Cylinder(radius=0.032, length=0.020),
        origin=Origin(xyz=(barrel_x, 0.0, hinge_height / 2.0 + 0.060)),
        material=barrel_mat,
        name="top_pin_cap",
    )
    frame_leaf.visual(
        Cylinder(radius=0.032, length=0.020),
        origin=Origin(xyz=(barrel_x, 0.0, -hinge_height / 2.0 - 0.060)),
        material=barrel_mat,
        name="bottom_pin_cap",
    )

    for side_name, part, leaf_y in (
        ("frame", frame_leaf, fixed_leaf_center_y),
        ("door", door_leaf, swing_leaf_center_y),
    ):
        for idx, (dy, z) in enumerate(((-0.12, 0.38), (0.12, 0.38), (-0.12, -0.38), (0.12, -0.38)), start=1):
            add_countersunk_screw(
                part,
                x=screw_face_x,
                y=leaf_y + dy,
                z=z,
                material=screw_mat,
                slot_material=slot_mat,
                name=f"{side_name}_countersunk_screw_{idx}",
            )

    model.articulation(
        "revolute_swing_about_continuous_pin",
        ArticulationType.REVOLUTE,
        parent=frame_leaf,
        child=door_leaf,
        origin=Origin(xyz=(barrel_x, 0.0, 0.0)),
        axis=(0.0, 0.0, 1.0),
        motion_limits=MotionLimits(effort=12.0, velocity=1.5, lower=-0.10, upper=1.70),
    )

    return model


def run_tests() -> TestReport:
    ctx = TestContext(object_model)
    frame_leaf = object_model.get_part("frame_leaf")
    door_leaf = object_model.get_part("door_leaf")

    ctx.allow_overlap(
        frame_leaf,
        door_leaf,
        elem_a="continuous_hinge_pin_visible_core",
        elem_b="door_alternating_knuckle_1",
        reason="The continuous hinge pin intentionally passes through the moving leaf's upper barrel.",
    )
    ctx.allow_overlap(
        frame_leaf,
        door_leaf,
        elem_a="continuous_hinge_pin_visible_core",
        elem_b="door_alternating_knuckle_2",
        reason="The continuous hinge pin intentionally passes through the moving leaf's lower barrel.",
    )
    return ctx.report()


object_model = build_object_model()
