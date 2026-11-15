import bpy
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 16
sc.cycles.use_adaptive_sampling = True
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 3
sc.cycles.diffuse_bounces = 1
sc.cycles.glossy_bounces = 2
sc.cycles.transmission_bounces = 0
sc.cycles.transparent_max_bounces = 2
sc.render.use_motion_blur = True
sc.render.motion_blur_shutter = .4
sc.render.use_persistent_data = True
sc.render.resolution_percentage = 80
sc.cycles.use_auto_tile = False
