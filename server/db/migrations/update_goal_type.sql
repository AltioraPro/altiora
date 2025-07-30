-- Migration pour mettre à jour les objectifs avec goalType "binary" vers "gradual"
UPDATE altiora_goal 
SET goal_type = 'gradual' 
WHERE goal_type = 'binary'; 