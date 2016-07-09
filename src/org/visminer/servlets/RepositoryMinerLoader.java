package org.visminer.servlets;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

import org.repositoryminer.persistence.Connection;

public class RepositoryMinerLoader extends HttpServlet{
	
	private static final long serialVersionUID = 1L;

	public void init() throws ServletException {
		System.out.println("Configuring Database...");
		
		Connection connection = Connection.getInstance();
		connection.connect("mongodb://localhost:27017", "visminer");
	}

	public void destroy() {
		System.out.println("Closing Database...");	
		super.destroy();
	}
	
}
