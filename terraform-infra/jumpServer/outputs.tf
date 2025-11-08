output "bastion-sg-id" {
  value = aws_security_group.bastion_sg.id
<<<<<<< HEAD
}
=======
}

output "bastion_public_ip" {
  value       = aws_instance.bastion_host.public_ip
  description = "Public IP of the bastion server"
}
>>>>>>> e33acf5 (adding the rds + secrets infra)
